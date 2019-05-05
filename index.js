const path = require('path')
const babelPluginFrontmatter = require('./babelPlugin')
const frontmatterExtractPlugin = require('./plugin')
const { createConfigItem } = require('@babel/core')

module.exports = function mdxEnhancedPlugin(pluginOptions = {}) {
  if (!pluginOptions.layoutPath) pluginOptions.layoutPath = 'layouts'

  return (nextConfig = {}) => {
    // We want to add "mdx" to the page extensions but also don't want to
    // clobber any pre-existing extensions configured.
    if (!nextConfig.pageExtensions) {
      nextConfig.pageExtensions = ['js', 'jsx']
    }

    if (nextConfig.pageExtensions.indexOf('mdx') === -1) {
      nextConfig.pageExtensions.unshift('mdx')
    }

    return Object.assign({}, nextConfig, {
      webpack(config, options) {
        // Add mdx loaders to webpack rules
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

        // Frontmatter must be extracted in a separate plugin hook that runs before loaders.
        // Webpack does not process files in a specific order, but we must guarantee that
        // frontmatter has all been extracted before files that could potentially require it
        // are evaluated through the loader. More details in the plugin source.
        // config.plugins.push(new frontmatterExtractPlugin(options))

        // Inject the frontmatter extraction babel plugin
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

        // If the config already has a webpack configuration, then we want to
        // call that to do their customizations.
        if (typeof nextConfig.webpack === 'function') {
          return nextConfig.webpack(config, options)
        }

        return config
      }
    })
  }
}
