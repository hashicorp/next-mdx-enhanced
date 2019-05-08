const fs = require('fs-extra')
const path = require('path')
const matter = require('gray-matter')
const { generateFrontmatterPath } = require('./util')
const { promisify } = require('util')
const globCb = require('glob')
const glob = promisify(globCb)

module.exports = class MdxFrontmatterExtractionPlugin {
  constructor(options) {
    this.nextConfig = options
  }

  apply(compiler) {
    // This hook only runs on a single build
    compiler.hooks.run.tapPromise('MdxFrontmatterPlugin', compilation => {
      return this.getAllMdxPaths(compilation.context)
    })

    // This hook only runs in watch mode
    compiler.hooks.watchRun.tapPromise('MdxFrontmatterPlugin', compilation => {
      // when nextjs is in dev mode, it runs a server and client side webpack build
      // we only need to extract the front matter once, so we arbitrarily pick the
      // client compilation pass to run this for.
      if (compilation.name !== 'client') return Promise.resolve()

      // Otherwise, let's do the thing
      const webpackFd = compilation._lastCompilationFileDependencies
      const changedFiles = webpackFd
        ? [...webpackFd].filter(f => !f.match(/node_modules/))
        : []
      changedFiles.map(f => console.log(`Changed: ${f}`))
      const changedMdx = changedFiles.filter(f => f.match(/\.mdx$/))
      return this.extractFrontMatter(changedMdx)
    })
  }

  getAllMdxPaths(root) {
    return glob('pages/**/*.mdx', { cwd: root }).then(files =>
      this.extractFrontMatter(files.map(f => path.join(root, f)))
    )
  }

  // Given an array of absolute file paths, write out the front matter to a json file
  extractFrontMatter(files) {
    return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
      .then(fileContents => {
        const fmPaths = files.map(f =>
          generateFrontmatterPath(f, this.nextConfig)
        )
        const frontMatter = fileContents.map(content => matter(content).data)
        return Promise.all(
          fmPaths.map(fmPath => fs.ensureDir(path.dirname(fmPath)))
        ).then(() => [frontMatter, fmPaths])
      })
      .then(([contents, fmPaths]) => {
        return Promise.all(
          contents.map((content, idx) => {
            fs.writeFile(fmPaths[idx], JSON.stringify(content))
          })
        )
      })
  }
}
