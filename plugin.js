const fs = require('fs-extra')
const path = require('path')
const { generateFrontmatterPath } = require('./util')
const matter = require('gray-matter')

module.exports = class MdxFrontmatterExtractionPlugin {
  constructor(options) {
    this.nextConfig = options
  }

  apply(compiler) {
    // This hook only runs on a single build
    compiler.hooks.run.tapPromise('MdxFrontmatterPlugin', compilation => {
      return new Promise((resolve, reject) => {
        const root = compilation.context
        // read all the mdx files with glob
        // pull all the front matter
        // we should memory-cache these results
        // write out the front matter to files based on the hashed paths
        // we should be set
        setTimeout(() => {
          console.log('webpack run hook complete')
          resolve()
        }, 3000)
      })
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
      return extractFrontMatter.call(this, compilation.context, changedMdx)
    })
  }
}

function extractFrontMatter(root, files) {
  return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
    .then(fileContents => {
      const fmPaths = fileContents.map(f =>
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
