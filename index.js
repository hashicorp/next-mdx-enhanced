const fs = require('fs')
const matter = require('gray-matter')
const path = require('path')
const withPrebuild = require('@hashicorp/next-prebuild')
const { createConfigItem } = require('@babel/core')
const { generateFrontmatterPath } = require('./util')
const babelPluginFrontmatter = require('./plugin')

function extractFrontMatter(files, root) {
  return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
    .then(fileContents => {
      const fmPaths = files.map(f =>
        generateFrontmatterPath(f, this.nextConfig)
      )
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

const withEnhancedMdx = (pluginOptions = {}) => (nextConfig = {}) => {
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

      config.module.rules = config.module.rules.map(rule => {
        if (rule.use.loader === 'next-babel-loader') {
          if (!rule.use.options.plugins) rule.use.options.plugins = []
          rule.use.options.plugins.push(
            createConfigItem(babelPluginFrontmatter(options))
          )
        }
        return rule
      })

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    }
  })
}

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  return [
    withPrebuild({
      build: (_, compilation, files) => {
        extractFrontMatter(files, compilation.context)
      },
      watch: (_, compilation, files) => {
        extractFrontMatter(files, compilation.context)
      },
      files: {
        pattern: 'pages/**/*.mdx',
        addFilesAsDependencies: true
      }
    }),
    withEnhancedMdx(pluginOptions)
  ].reduce((acc, next) => next(acc), nextConfig)
}
