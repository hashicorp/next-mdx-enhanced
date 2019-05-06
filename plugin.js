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
        // can we get the file(s) that changed off the compiler or compilation object?
        // if not, dive into compilation hooks and see if we can find one thats async
        // and reliably runs before modules resolve that will give it to us
        // once we have the changed file, do the front matter write for just that file
        setTimeout(() => {
          console.log('webpack watchRun hook complete')
          resolve()
        }, 3000)
      })
    })
  }
}
