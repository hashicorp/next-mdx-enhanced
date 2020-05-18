const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  extendFrontMatter: {
    process: (mdxContent, frontMatter) => {
      return {
        __outline: 'outline stuff',
        layout: 'docs-page',
        reversePath: frontMatter.__resourcePath.split('').reverse().join(''),
      }
    },
  },
})()
