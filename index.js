import path from 'path'

export default (nextConfig = {}) => {
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
            options
          }
        ]
      })

      // TODO: add babel plugin for front matter to webpack rules

      // If the config already has a webpack configuration, then we want to
      // call that to do their customizations.
      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options)
      }

      return config
    }
  })
}
