const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  extendFrontMatter: {
    process: (mdxContent, frontMatter) => {
      return new Promise(resolve =>
        setTimeout(() => {
          return resolve({
            __async: 'this data is async',
            reversePath: frontMatter.__resourcePath.split('').reverse().join('')
          })
        }, 50)
      )
    },
  },
})()
