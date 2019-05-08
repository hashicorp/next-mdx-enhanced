const crypto = require('crypto')
const fs = require('fs-extra')
const glob = require('glob')
const matter = require('gray-matter')
const path = require('path')
const stringifyObject = require('stringify-object')
const { generateFrontmatterPath } = require('./util')

async function writeFrontmatterFileToDisk(filePath, frontMatter, nextConfig) {
  const frontmatterPath = generateFrontmatterPath(filePath, nextConfig)
  await fs.ensureDir(path.dirname(frontmatterPath))
  await fs.writeFile(frontmatterPath, JSON.stringify(frontMatter))
}

function modifyFileIfLayoutExists(filePath, content, frontMatter, nextConfig) {
  return new Promise((resolve, reject) => {
    if (!frontMatter.layout) return resolve()

    const layoutPath = path.resolve(
      nextConfig.dir,
      nextConfig.config.layoutPath,
      frontMatter.layout
    )

    // If the layout doesn't exist, throw a descriptive error
    // We use glob to check for existence, since the file could have multiple page
    // extensions depending on the config
    const layoutMatcher = `${layoutPath}.+(${nextConfig.config.pageExtensions.join(
      '|'
    )})`

    glob(layoutMatcher, (err, matches) => {
      if (err) return reject(err)
      if (!matches.length) {
        throw new Error(
          `File "${filePath}" specified "${
            frontMatter.layout
          }" as its layout, but no matching file was found at "${layoutMatcher}"`
        )
      }

      fs.writeFile(
        filePath,
        `import layout from '${layoutPath}'

export default layout(${stringifyObject(frontMatter)})

${content}
`
      ).then(() => resolve())
    })
  })
}
module.exports = class MdxFrontmatterExtractionPlugin {
  constructor(options) {
    this.nextConfig = options
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise('MdxFrontmatterPlugin', compilation => {
      let promises = []
      const root = this.nextConfig.dir

      return new Promise((resolve, reject) => {
        glob('**/*.mdx', { cwd: root }, (err, matches) => {
          if (err) reject(err)
          if (!matches.length) resolve()

          promises = matches.reduce((acc, filePath) => {
            const fullPath = path.resolve(root, filePath)
            const { content, data: frontMatter } = matter(
              fs.readFileSync(fullPath)
            )
            return [
              ...acc,
              writeFrontmatterFileToDisk(
                fullPath,
                frontMatter,
                this.nextConfig
              ),
              modifyFileIfLayoutExists(
                fullPath,
                content,
                frontMatter,
                this.nextConfig
              )
            ]
          }, [])

          return Promise.all(promises)
            .then(() => resolve())
            .catch(err => new Error(err))
        })
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
