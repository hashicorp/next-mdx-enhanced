const fs = require('fs-extra')
const matter = require('gray-matter')
const path = require('path')
const { PrebuildWebpackPlugin } = require('@hashicorp/prebuild-webpack-plugin')
const { createConfigItem } = require('@babel/core')
const { generateFrontmatterPath } = require('./util')
const babelPluginFrontmatter = require('./babelPlugin')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  if (!pluginOptions.layoutPath) pluginOptions.layoutPath = 'layouts'

  // Set default pageExtensions if not set already
  if (!nextConfig.pageExtensions) {
    nextConfig.pageExtensions = ['jsx', 'js']
  }

  // Add mdx as a page extension so that mdx files are compiled as pages
  if (nextConfig.pageExtensions.indexOf('mdx') === -1) {
    nextConfig.pageExtensions.unshift('mdx')
  }

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      // Add mdx webpack loader stack
      config.module.rules.push({
        test: /\.mdx?$/,
        use: [
          options.defaultLoaders.babel,
          '@mdx-js/loader',
          {
            loader: path.join(__dirname, './loader'),
            options: Object.assign({}, options, {
              mdxEnhancedPluginOptions: pluginOptions,
            }),
          },
        ],
      })

      // Add babel plugin to rewrite front matter imports
      config.module.rules = config.module.rules.map(rule => {
        if (rule.use.loader === 'next-babel-loader') {
          if (!rule.use.options.plugins) rule.use.options.plugins = []
          rule.use.options.plugins.push(
            createConfigItem(babelPluginFrontmatter(options))
          )
        }
        return rule
      })

      // Add webpack plugin that extracts front matter
      config.plugins.push(
        new PrebuildWebpackPlugin({
          build: (_, compilation, files) => {
            return extractFrontMatter(files, compilation.context)
          },
          watch: (_, compilation, files) => {
            return extractFrontMatter(files, compilation.context)
          },
          files: {
            pattern: '**/*.mdx',
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
function extractFrontMatter(files, root) {
  return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
    .then(fileContents => {
      const fmPaths = files.map(f => generateFrontmatterPath(f, root))
      const frontMatter = fileContents.map((content, idx) => {
        return {
          ...matter(content).data,
          __resourcePath: files[idx].replace(path.join(root, 'pages'), ''),
        }
      })
      return Promise.all(
        fmPaths.map(fmPath => fs.ensureDir(path.dirname(fmPath)))
      ).then(() => [frontMatter, fmPaths])
    })
    .then(([contents, fmPaths]) => {
      return Promise.all(
        contents.map((content, idx) => {
          fs.writeFile(fmPaths[idx], JSON.stringify(content))
        })
      )
    })
}
