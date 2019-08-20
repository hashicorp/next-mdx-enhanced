const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  extendFrontMatter: {
    process: mdxContent => {
      return new Promise(resolve =>
        setTimeout(() => {
          return resolve({ __async: 'this data is async' })
        }, 50)
      )
    },
    phase: 'prebuild',
  },
})()
