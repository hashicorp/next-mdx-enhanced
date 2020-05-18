const path = require('path')
const fs = require('fs')
const { transform } = require('@babel/core')
const plugin = require('../babelPlugin')

test('transforms as intended', () => {
  const mockNextOptions = { dir: 'PATH/TO/NEXT/PROJECT' }
  const mockPluginOptions = { fileExtensions: ['mdx'] }
  const { content, filename } = loadFixture('basic')
  const { code } = transform(content, {
    plugins: [plugin(mockNextOptions, mockPluginOptions)],
    filename,
  })
  expect(code).toMatchSnapshot()
})

function loadFixture(name) {
  const filename = path.join(__dirname, `fixtures/babel/${name}.js`)
  return { content: fs.readFileSync(filename, 'utf8'), filename }
}
