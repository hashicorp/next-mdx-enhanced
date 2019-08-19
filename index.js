const fs = require('fs-extra')
const matter = require('gray-matter')
const path = require('path')
const PrebuildWebpackPlugin = require('prebuild-webpack-plugin')
const { generateFrontmatterPath, extendFrontMatter } = require('./util')
const babelPluginFrontmatter = require('./babelPlugin')
const debug = require('debug')('next-mdx-enhanced')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  if (!pluginOptions.layoutPath) pluginOptions.layoutPath = 'layouts'

  // Set default pageExtensions if not set already
  if (!nextConfig.pageExtensions) {
    // This extension list should be kept in sync with the NextJS default:
    // https://github.com/zeit/next.js/blob/d9abbaded1a443056a5cee68d6bbda6f42057dae/packages/next-server/server/config.ts#L19
    nextConfig.pageExtensions = ['tsx', 'ts', 'jsx', 'js']
  }

  // Add mdx as a page extension so that mdx files are compiled as pages
  if (nextConfig.pageExtensions.indexOf('mdx') === -1) {
    nextConfig.pageExtensions.unshift('mdx')
  }

  // Set default 'phase' for extendFrontMatter option
  if (
    pluginOptions.extendFrontMatter &&
    !pluginOptions.extendFrontMatter.phase
  ) {
    pluginOptions.extendFrontMatter.phase = 'both'
  }

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      // Add mdx webpack loader stack
      config.module.rules.push({
        test: /\.mdx?$/,
        use: [
          options.defaultLoaders.babel,
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: pluginOptions.remarkPlugins || [],
              rehypePlugins: pluginOptions.rehypePlugins || []
            }
          },
          {
            loader: path.join(__dirname, 'loader'),
            options: Object.assign({}, options, {
              mdxEnhancedPluginOptions: pluginOptions
            })
          }
        ]
      })

      // Add babel plugin to rewrite front matter imports
      config.module.rules = config.module.rules.map(rule => {
        if (rule.use.loader === 'next-babel-loader') {
          if (!rule.use.options.plugins) rule.use.options.plugins = []
          rule.use.options.plugins.push(babelPluginFrontmatter(options))
        }
        return rule
      })

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
            pattern: '**/*.mdx',
            options: { cwd: config.context },
            addFilesAsDependencies: true
          }
        })
      )

      // Don't clobber previous plugins' webpack functions
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    }
  })
}

// Given an array of absolute file paths, write out the front matter to a json file
async function extractFrontMatter(pluginOptions, files, root) {
  debug('start: read all mdx files')
  const fileContents = await Promise.all(files.map(f => fs.readFile(f, 'utf8')))
  debug('finish: read all mdx files')
  const fmPaths = files.map(f => generateFrontmatterPath(f, root))
  debug('start: frontmatter extensions')
  const frontMatter = await Promise.all(
    fileContents.map(async (content, idx) => {
      const extendedFm = await extendFrontMatter({
        content,
        phase: 'prebuild',
        extendFm: pluginOptions.extendFrontMatter
      })

      const { data } = matter(content, {
        safeLoad: true,
        filename: files[idx]
      })

      return {
        ...data,
        ...extendedFm,
        __resourcePath: files[idx]
          .replace(path.join(root, 'pages'), '')
          .substring(1)
      }
    })
  ).catch(console.error)
  // TODO: remove this catch once this issue has been resolved
  // https://github.com/zeit/next.js/issues/8068
  debug('finish: frontmatter extensions')
  debug('start: .mdx-data creation')
  await Promise.all(fmPaths.map(fmPath => fs.ensureDir(path.dirname(fmPath))))
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
