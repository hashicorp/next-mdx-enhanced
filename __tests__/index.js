const path = require('path')
const fs = require('fs')
const nextBuild = require('next/dist/build').default
const nextExport = require('next/dist/export').default
const nextConfig = require('./fixtures/basic/next.config.js')

const basicFixture = path.join(__dirname, 'fixtures/basic')

// increase timeout since these are integration tests
jest.setTimeout(10000)

test('works', async () => {
  const outPath = await compileNextjs(basicFixture, nextConfig)
  expectContentMatch(outPath, 'index.html', /Hello world/)
})

// Test Utilities

function compileNextjs(projectPath, config) {
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
