const withMdxEnhanced = require('../../..')

module.exports = (configFn) =>
  withMdxEnhanced({
    onContent: (mdxContent) => configFn(mdxContent),
  })()
