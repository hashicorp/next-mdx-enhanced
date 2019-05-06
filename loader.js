const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const matter = require('gray-matter')
const stringifyObject = require('stringify-object')
const { getOptions } = require('loader-utils')
const { generateFrontmatterPath } = require('./util')

// Loads markdown files with front matter and renders them into a layout.
// Layout can be set using the `layout` key in the front matter, and will map
// to a file name in the pages/layouts directory.
module.exports = async function mdxEnhancedLoader(src) {
  const callback = this.async()
  const options = getOptions(this)

  // Parse the front matter
  const { content, data } = matter(src)

  // Sometimes it's important to know the file path within the layout, we add this
  // as a special prop to the front matter, __resourcePath.
  const resourcePath = this.resourcePath.replace(
    path.join(this.rootContext, 'pages'),
    ''
  )

  // We have two things we need to do in parallel here:
  // - extract the front matter and write it out to its own file
  // - check if there's a layout, if there is, resolve the layout and wrap the content
  // Whenever they are both complete, we can move on. We return the results of processLayout
  // only, because it returns the content we want to replace the file with, where the
  // front matter extraction function just writes a file out.
  Promise.all([
    extractFrontmatter.call(this, options, data, resourcePath),
    processLayout.call(this, options, data, resourcePath, content)
  ])
    .then(([_, result]) => callback(null, result))
    .catch(err => callback(err))
}

//
async function extractFrontmatter(options, frontMatter, resourcePath) {
  const frontmatterPath = generateFrontmatterPath(this.resourcePath, options)
  await fs.ensureDir(path.dirname(frontmatterPath))
  await fs.writeFile(frontmatterPath, JSON.stringify(frontMatter))
}

function processLayout(options, frontMatter, resourcePath, content) {
  return new Promise((resolve, reject) => {
    // If no layout is provided, return the content directly.
    if (!frontMatter.layout) return resolve(content)

    // Layouts default to resolving from "<root>/layouts", but this is configurable
    const layoutPath = path.resolve(
      options.dir,
      options.mdxEnhancedPluginOptions.layoutPath,
      frontMatter.layout
    )

    // If the layout doesn't exist, throw a descriptive error
    // We use glob to check for existence, since the file could have multiple page
    // extensions depending on the config
    const layoutMatcher = `${layoutPath}.+(${options.config.pageExtensions.join(
      '|'
    )})`
    glob(layoutMatcher, (err, matches) => {
      if (err) return reject(err)
      if (!matches.length) {
        throw new Error(
          `File "${resourcePath}" specified "${
            frontMatter.layout
          }" as its layout, but no matching file was found at "${layoutMatcher}"`
        )
      }

      // Import the layout, export the layout-wrapped content, pass front matter into layout
      return resolve(`import layout from '${layoutPath}'

export default layout(${stringifyObject(frontMatter)})

${content}
`)
    })
  })
}
