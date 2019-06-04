const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  extendFrontMatter: {
    process: mdxContent => {
      return {
        __outline: 'outline stuff',
      }
    },
  },
})()
