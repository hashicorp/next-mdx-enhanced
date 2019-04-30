const path = require('path')
const fs = require('fs')
const nextBuild = require('next/dist/build').default
const nextExport = require('next/dist/export').default

const basicFixture = path.join(__dirname, 'fixtures/basic')

// increase timeout since these are integration tests
jest.setTimeout(10000)

test('works', async () => {
  const outPath = await compileNextjs(basicFixture)
  expectContentMatch(outPath, 'index.html', /Hello world/)
  expectContentMatch(
    outPath,
    'docs/advanced/index.html',
    /<p>LAYOUT TEMPLATE<\/p>/
  )
  expectContentMatch(
    outPath,
    'docs/advanced/index.html',
    /<h1>Advanced Docs<\/h1>/
  )
  expectContentMatch(
    outPath,
    'docs/intro/index.html',
    /<p>LAYOUT TEMPLATE<\/p>/
  )
  expectContentMatch(outPath, 'docs/intro/index.html', /<h1>Intro Docs<\/h1>/)
  expectContentMatch(
    outPath,
    'docs/intro/index.html',
    /some <em>introductory<\/em> docs content/
  )
})

// Test Utilities

function compileNextjs(projectPath) {
  const config = require(path.join(projectPath, 'next.config.js'))
  const outPath = path.join(projectPath, 'out')
  return nextBuild(projectPath, config)
    .then(() => {
      return nextExport(projectPath, {
        outdir: outPath,
        silent: true
      })
    })
    .then(() => outPath)
}

function expectContentMatch(outPath, filePath, matcher) {
  const content = fs.readFileSync(path.join(outPath, filePath), 'utf8')
  return expect(content).toMatch(matcher)
}
