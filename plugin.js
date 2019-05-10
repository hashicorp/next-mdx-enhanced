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
    this.firstRun = true
  }

  apply(compiler) {
    // This hook only runs on a single build
    compiler.hooks.run.tapPromise('MdxFrontmatterPlugin', compilation => {
      return this.getAllMdxFilesAndExtractFrontmatter(compilation.context)
    })

    // This hook only runs in watch mode
    compiler.hooks.watchRun.tapPromise('MdxFrontmatterPlugin', compilation => {
      // On the first run for watch, we need to do an initial front matter extraction
      if (this.firstRun) {
        this.firstRun = false
        return this.getAllMdxFilesAndExtractFrontmatter(compilation.context)
      }

      // When nextjs is in dev mode, it runs a server and client side webpack build
      // we only need to extract the front matter once, so we arbitrarily pick the
      // client compilation pass to run this for.
      if (compilation.name !== 'client') return Promise.resolve()

      // Get the files changed since the last compilation via webpack
      const changedFiles = compilation.watchFileSystem.watcher.mtimes

      // Pare down changed files to only mdx files
      const changedMdx = Object.keys(changedFiles).filter(f =>
        f.match(/\.mdx$/)
      )

      // If there aren't any mdx files, exit early
      if (!changedMdx.length) return Promise.resolve()

      // Extract the front matter!
      return this.extractFrontMatter(changedMdx)
    })

    // This hook runs in both modes, as webpack is finising up
    compiler.hooks.emit.tapAsync('MdxFrontmatterPlugin', (compilation, cb) => {
      // If there's an import like `import {frontMatter} from './foo.mdx', this gets
      // rewritten to `import frontMatter from './9832h92.json'`, which is the purpose
      // of this plugin. However, webpack is then unaware that `./foo.mdx` is a dependency,
      // so when it changes, watch mode will not recompile. So here, we will re-add any mdx
      // files that are not present, so we get the "livereload" effect.

      // TODO: This does not handle the case where a new mdx file is added while watching

      this.projectMdxFiles.map(mdxFile => {
        compilation.fileDependencies.add(mdxFile)
      })

      cb()
    })
  }

  // Gets all mdx files that are in the `<root>/pages` directory, recursively, and
  // writes out all their front matter.
  getAllMdxFilesAndExtractFrontmatter(root) {
    return glob('pages/**/*.mdx', { cwd: root }).then(files => {
      this.projectMdxFiles = files.map(f => path.join(root, f))
      this.extractFrontMatter(this.projectMdxFiles, root)
    })
  }

  // Given an array of absolute file paths, write out the front matter to a json file.
  extractFrontMatter(files, root) {
    return Promise.all(files.map(f => fs.readFile(f, 'utf8')))
      .then(fileContents => {
        const fmPaths = files.map(f =>
          generateFrontmatterPath(f, this.nextConfig)
        )
        // extract front matter, add __resourcePath
        const frontMatter = fileContents.map((content, idx) => {
          return {
            ...matter(content).data,
            __resourcePath: files[idx].replace(root, '')
          }
        })
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
