const fs = require('fs-extra')
const path = require('path')
const { generateFrontmatterPath } = require('./util')
const matter = require('gray-matter')

module.exports = class MdxFrontmatterExtractionPlugin {
  constructor(options) {
    this.nextConfig = options
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('MdxFrontmatterPlugin', compilation => {
      // This hook instantiation will have to be updated when webpack@5 is released
      compilation.hooks.beforeModuleAssets.tap(
        'MdxFrontmatterPlugin',
        loaderContext => {
          console.log('running hook')
          // const resourcePath = loaderContext._module.resource
          // if (resourcePath.match(/\.mdx$/)) {
          //   const src = fs.readFileSync(resourcePath)
          //   const { data } = matter(src)
          //   const frontmatterPath = generateFrontmatterPath(
          //     resourcePath,
          //     this.nextConfig
          //   )
          //   fs.ensureDirSync(path.dirname(frontmatterPath))
          //   fs.writeFileSync(
          //     frontmatterPath,
          //     JSON.stringify(
          //       Object.assign({}, data, { __resourcePath: resourcePath })
          //     )
          //   )
          //   console.log('plugin file write')
          // }
        }
      )
    })
  }
}
