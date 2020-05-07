const fs = require('fs-extra')
const matter = require('gray-matter')
const path = require('path')
const PrebuildWebpackPlugin = require('prebuild-webpack-plugin')
const { generateFrontmatterPath, extendFrontMatter } = require('./util')
const babelPluginFrontmatter = require('./babelPlugin')
const debug = require('debug')('next-mdx-enhanced')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  if (!pluginOptions.layoutPath) pluginOptions.layoutPath = 'layouts'
  if (!pluginOptions.fileExtensions) pluginOptions.fileExtensions = ['mdx']

  // This extension list should be kept in sync with the NextJS default:
  // https://github.com/zeit/next.js/blob/d9abbaded1a443056a5cee68d6bbda6f42057dae/packages/next-server/server/config.ts#L19
  if (!nextConfig.pageExtensions) {
    nextConfig.pageExtensions = ['jsx', 'js', 'tsx', 'ts']
  }

  // Add supported file extensions as page extensions so that mdx files are compiled as pages
  pluginOptions.fileExtensions.forEach((ext) => {
    if (nextConfig.pageExtensions.indexOf(ext) === -1) {
      nextConfig.pageExtensions.unshift(ext)
    }
  })

  // Set default 'phase' for extendFrontMatter option
  if (
    pluginOptions.extendFrontMatter &&
    !pluginOptions.extendFrontMatter.phase
  ) {
    pluginOptions.extendFrontMatter.phase = 'both'
  }

  return Object.assign({}, nextConfig, { 
    webpack(config, options) {
      // Check whether `src/pages` exists
      const usesSrc = fs.existsSync(path.join(config.context, '/src/pages'));
      pluginOptions.usesSrc = usesSrc;
      // Add mdx webpack loader stack
      config.module.rules.push({
        test: new RegExp(`\\.(${pluginOptions.fileExtensions.join('|')})$`),
        use: [
          options.defaultLoaders.babel,
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: pluginOptions.remarkPlugins || [],
              rehypePlugins: pluginOptions.rehypePlugins || [],
            },
          },
          {
            loader: path.join(__dirname, 'loader'),
            options: Object.assign({}, options, {
              mdxEnhancedPluginOptions: pluginOptions,
            }),
          },
        ],
      })

      // Add babel plugin to rewrite front matter imports
      config.module.rules = dangerouslyInjectBabelPlugin(
        config.module.rules,
        babelPluginFrontmatter(options, pluginOptions)
      )

      // Add webpack plugin that extracts front matter
      config.plugins.push(
        new PrebuildWebpackPlugin({
          compilationNameFilter: 'client',
          build: (_, compilation, files) => {
            return extractFrontMatter(pluginOptions, files, compilation.context)
          },
          watch: (_, compilation, files) => {
            return extractFrontMatter(pluginOptions, files, compilation.context)
          },
          files: {
            pattern:
              pluginOptions.fileExtensions.length > 1
                ? `**/*.{${pluginOptions.fileExtensions.join(',')}}`
                : `**/*.${pluginOptions.fileExtensions[0]}`,
            options: { cwd: config.context },
            addFilesAsDependencies: true,
          },
        })
      )

      // Don't clobber previous plugins' webpack functions
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    },
  })
}

// Given an array of absolute file paths, write out the front matter to a json file
async function extractFrontMatter(pluginOptions, files, root) {
  debug('start: read all mdx files')
  const fileContents = await Promise.all(
    files.map((f) => fs.readFile(f, 'utf8'))
  )
  debug('finish: read all mdx files')
  const fmPaths = files.map((f) => generateFrontmatterPath(f, root))
  debug('start: frontmatter extensions')
  const frontMatter = await Promise.all(
    fileContents.map(async (content, idx) => {
      // The next steps serve to support placing pages under `src/pages`:
      
      let __resourcePath = '';

      // 2. Create resource path from file path if using `src/pages`
      if(pluginOptions.usesSrc) {
        // Add `src/` to the resource path
        __resourcePath = files[idx]
        .replace(path.join(root, "src/" , 'pages'), '')
        .substring(1)
      } else {
        // Otherwise return default 
        __resourcePath = files[idx]
        .replace(path.join(root, 'pages'), '')
        .substring(1)
      }

      const { data } = matter(content, {
        safeLoad: true,
        filename: files[idx],
      })

      const extendedFm = await extendFrontMatter({
        content,
        frontMatter: {
          ...data,
          __resourcePath,
        },
        phase: 'prebuild',
        extendFm: pluginOptions.extendFrontMatter,
      })

      return {
        ...data,
        ...extendedFm,
        __resourcePath,
      }
    })
  ).catch(console.error)
  // TODO: remove this catch once this issue has been resolved
  // https://github.com/zeit/next.js/issues/8068
  debug('finish: frontmatter extensions')
  debug('start: .mdx-data creation')
  await Promise.all(fmPaths.map((fmPath) => fs.ensureDir(path.dirname(fmPath))))
  debug('finish: .mdx-data creation')
  debug('start: write data files')
  return Promise.all(
    frontMatter.map((content, idx) => {
      fs.writeFile(fmPaths[idx], JSON.stringify(content))
    })
  ).then(() => {
    debug('finish: write data files')
  })
}

function dangerouslyInjectBabelPlugin(rules, plugin) {
  return rules.map((rule) => {
    if (!rule.use) return rule

    // `use` can either be an array or an object - we handle both scenarios here
    if (Array.isArray(rule.use)) {
      for (let i = 0; i < rule.use.length; i++) {
        rule.use[i] = _inject(rule.use[i], plugin)
      }
    } else {
      rule.use = _inject(rule.use, plugin)
    }

    return rule
  })
}

function _inject(rule, plugin) {
  if (rule.loader !== 'next-babel-loader') return rule
  // create a plugins property if not already present
  if (!rule.options.plugins) rule.options.plugins = []
  // push the plugin if its not already there
  if (!rule.options.plugins.find((p) => p.name === plugin.name)) {
    rule.options.plugins.push(plugin)
  }
  return rule
}
