const path = require('path')
const matter = require('gray-matter')
const glob = require('glob')
const stringifyObject = require('stringify-object')
const { getOptions } = require('loader-utils')

// Loads markdown files with front matter and renders them into a layout.
// Layout can be set using the `layout` key in the front matter, and will map
// to a file name in the pages/layouts directory.
module.exports = async function mdxEnhancedLoader(src) {
  const callback = this.async()
  const options = getOptions(this)

  // Parse the front matter
  const { content, data } = matter(src)

  // Get file path relative to project root
  const resourcePath = this.resourcePath
    .replace(path.join(this.rootContext, 'pages'), '')
    .substring(1)

  // Checks if there's a layout, if there is, resolve the layout and wrap the content in it.
  processLayout
    .call(this, options, data, content, resourcePath)
    .then(result => callback(null, result))
    .catch(err => callback(err))
}

function processLayout(options, frontMatter, content, resourcePath) {
  return new Promise((resolve, reject) => {
    // If no layout is provided and the default layout setting is not on, return the
    // content directly.
    if (!frontMatter.layout && !options.mdxEnhancedPluginOptions.defaultLayout)
      return resolve(content)

    // Layouts default to resolving from "<root>/layouts", but this is configurable.
    // If the frontMatter doesn't have a layout and defaultLayout is true, try to
    // resolve the index file within the layouts path.
    const layoutPath = path.resolve(
      options.dir,
      options.mdxEnhancedPluginOptions.layoutPath,
      frontMatter.layout || 'index'
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

export default layout(${stringifyObject(
        Object.assign({}, frontMatter, { __resourcePath: resourcePath })
      )})

${content}
`)
    })
  })
}
