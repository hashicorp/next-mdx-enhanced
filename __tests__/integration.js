const path = require('path')
const fs = require('fs')
const rmfr = require('rmfr')
const nextBuild = require('next/dist/build').default
const nextExport = require('next/dist/export').default
const glob = require('glob')

// increase timeout since these are integration tests
jest.setTimeout(20000)

test('basic integration test', async () => {
  const basicFixture = path.join(__dirname, 'fixtures/basic')
  const outPath = await compileNextjs(basicFixture)
  expectContentMatch(outPath, 'index.html', /Hello world/)
  expectContentMatch(outPath, 'docs/advanced.html', /<p>LAYOUT TEMPLATE<\/p>/)
  expectContentMatch(outPath, 'docs/advanced.html', /<h1>Advanced Docs<\/h1>/)
  expectContentMatch(outPath, 'docs/intro.html', /<p>LAYOUT TEMPLATE<\/p>/)
  expectContentMatch(outPath, 'docs/intro.html', /<h1>Intro Docs<\/h1>/)
  expectContentMatch(
    outPath,
    'docs/intro.html',
    /some <em>introductory<\/em> docs content/
  )
})

test('options.layoutPath and options.defaultLayout', async () => {
  const layoutsPathFixture = path.join(__dirname, 'fixtures/layouts-path')
  const outPath = await compileNextjs(layoutsPathFixture)
  expectContentMatch(outPath, 'index.html', /Hello world/)
  expectContentMatch(outPath, 'docs/advanced.html', /<p>LAYOUT TEMPLATE<\/p>/)
  expectContentMatch(outPath, 'docs/advanced.html', /<h1>Advanced Docs<\/h1>/)
  expectContentMatch(outPath, 'docs/intro.html', /<p>LAYOUT TEMPLATE<\/p>/)
  expectContentMatch(outPath, 'docs/intro.html', /<h1>Intro Docs<\/h1>/)
  expectContentMatch(
    outPath,
    'docs/intro.html',
    /some <em>introductory<\/em> docs content/
  )
})

describe('options.extendFrontMatter', () => {
  it('should work with a sync process fn', async () => {
    const extendFmFixture = path.join(__dirname, 'fixtures/extend-frontmatter')
    const outPath = await compileNextjs(extendFmFixture)
    expectContentMatch(outPath, 'index.html', /Hello world/)
  })

  it('should work with an async process fn', async () => {
    const extendFmFixture = path.join(__dirname, 'fixtures/extend-frontmatter')
    const outPath = await compileNextjs(extendFmFixture, 'next.config.async.js')
    expectContentMatch(outPath, 'index.html', /Hello world/)
  })
})

test('options.fileExtensions', async () => {
  const fileExtensionsFixture = path.join(__dirname, 'fixtures/file-extensions')
  const outPath = await compileNextjs(fileExtensionsFixture)
  expectContentMatch(outPath, 'index.html', /<p>md: <span>\.md<\/span><\/p>/)
  expectContentMatch(outPath, 'index.html', /<p>mdx: <span>\.mdx<\/span><\/p>/)
})

test('options.scan', async () => {
  const scansFixture = path.join(__dirname, 'fixtures/scan-mdx-content')
  const outPath = await compileNextjs(scansFixture)
  expectContentMatch(outPath, 'docs/intro.html', /css\?family=Press\+Start\+2P/)
  expectContentMatch(outPath, 'docs/intro.html', /<h1>We found snargles<\/h1>/)
  expectContentMatch(
    outPath,
    'docs/advanced.html',
    /<h1>Nigel Thornberry<\/h1>/
  )
})

test('options.onContent', async () => {
  const onContentFixture = path.join(__dirname, 'fixtures/on-content')
  let mdxPageCount = 0
  glob('**/**/*.mdx', { cwd: onContentFixture }, (err, files) => {
    if (err) throw err
    mdxPageCount = files.length
  })
  const mockCallback = jest.fn(content => console.log(content))
  const compile = await compileNextjsWithMockFunction(
    onContentFixture,
    'next.config-mock.js',
    mockCallback
  )
  expect(compile.mock.calls.length).toBe(mdxPageCount)
})

// Remove artifacts
afterAll(() => {
  return Promise.all([
    rmfr(path.join(__dirname, 'fixtures/*/out'), { glob: true }),
    rmfr(path.join(__dirname, 'fixtures/*/.mdx-data'), { glob: true }),
    rmfr(path.join(__dirname, 'fixtures/*/.next'), { glob: true })
  ])
})

// Test Utilities

function compileNextjs(projectPath, configPath = 'next.config.js') {
  const config = require(path.join(projectPath, configPath))
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

function compileNextjsWithMockFunction(
  projectPath,
  configPath = 'next.config.js',
  mockFn
) {
  const config = require(path.join(projectPath, configPath))
  const outPath = path.join(projectPath, 'out')
  return nextBuild(projectPath, config(mockFn)).then(() => {
    return nextExport(projectPath, {
      outdir: outPath,
      silent: true
    }).then(() => mockFn)
  })
}
