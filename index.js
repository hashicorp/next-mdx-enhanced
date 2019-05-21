const fs = require('fs-extra')
const matter = require('gray-matter')
const path = require('path')
const { PrebuildWebpackPlugin } = require('@hashicorp/prebuild-webpack-plugin')
const { createConfigItem } = require('@babel/core')

const { generateFrontmatterPath } = require('./util')
const babelPluginFrontmatter = require('./babelPlugin')

function addBabelPlugin(rules, options) {
  return rules.map(rule => {
    if (rule.use.loader === 'next-babel-loader') {
      if (!rule.use.options.plugins) rule.use.options.plugins = []
      rule.use.options.plugins.push(
        createConfigItem(babelPluginFrontmatter(options))
      )
    }
    return rule
  })
}

function extractFrontMatter(files, root) {
  return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
    .then(fileContents => {
      const fmPaths = files.map(f => generateFrontmatterPath(f, root))
      const frontMatter = fileContents.map((content, idx) => {
        return {
          ...matter(content).data,
          __resourcePath: files[idx].replace(path.join(root, 'pages'), '')
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

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  if (!pluginOptions.layoutPath) pluginOptions.layoutPath = 'layouts'

  if (!nextConfig.pageExtensions) {
    nextConfig.pageExtensions = ['jsx', 'js']
  }

  if (nextConfig.pageExtensions.indexOf('mdx') === -1) {
    nextConfig.pageExtensions.unshift('mdx')
  }

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: /\.mdx?$/,
        use: [
          options.defaultLoaders.babel,
          '@mdx-js/loader',
          {
            loader: path.join(__dirname, './loader'),
            options: Object.assign({}, options, {
              mdxEnhancedPluginOptions: pluginOptions
            })
          }
        ]
      })

      config.module.rules = addBabelPlugin(config.module.rules, options)

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

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
            addFilesAsDependencies: true
          }
        })
      )

      return config
    }
  })
}
