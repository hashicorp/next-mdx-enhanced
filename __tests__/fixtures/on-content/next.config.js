const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  onContent: (mdxContent) => processContent(mdxContent),
})()

function processContent(content) {
  console.log(content)
}
