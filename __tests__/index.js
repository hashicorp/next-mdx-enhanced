const path = require('path')
const nextBuild = require('next/dist/build').default
const nextExport = require('next/dist/export').default
const nextConfig = require('./fixtures/basic/next.config.js')

const basicFixture = path.join(__dirname, 'fixtures/basic')

test('works', async () => {
  const outPath = await compileNextjs(basicFixture, nextConfig)
  expect(true).toBe(true)
})

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
