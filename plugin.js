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
      return new Promise((resolve, reject) => {
        const root = compilation.context
        // when nextjs is in dev mode, it runs a server and client side webpack build
        // we only need to extract the front matter once, so we arbitrarily pick the
        // client compilation pass to run this for.
        if (compilation.name === 'client') {
          const webpackFd = compilation._lastCompilationFileDependencies
          const changedFiles = webpackFd
            ? [...webpackFd].filter(f => !f.match(/node_modules/))
            : []
          changedFiles.map(f => console.log(`Changed: ${f}`))
        }
        resolve()
      })
    })
  }
}
