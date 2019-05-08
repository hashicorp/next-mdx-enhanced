const path = require('path')
const babelPluginFrontmatter = require('./babelPlugin')
const MdxFrontmatterExtractPlugin = require('./plugin')
const { createConfigItem } = require('@babel/core')

module.exports = (pluginOptions = {}) => (nextConfig = {}) => {
  if (!nextConfig.pageExtensions) {
    nextConfig.pageExtensions = ['jsx', 'js']
  }

  if (nextConfig.pageExtensions.indexOf('mdx') === -1) {
    nextConfig.pageExtensions.unshift('mdx')
  }

  if (!nextConfig.layoutPath) nextConfig.layoutPath = 'layouts'

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: /\.mdx?$/,
        use: [options.defaultLoaders.babel, '@mdx-js/loader']
      })

      config.plugins.push(new MdxFrontmatterExtractPlugin(options))

      config.module.rules = config.module.rules.map(rule => {
        if (rule.use.loader === 'next-babel-loader') {
          if (!rule.use.options.plugins) rule.use.options.plugins = []
          rule.use.options.plugins.push(
            // in theory we can pass options directly to the plugin rather than wrapping
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
