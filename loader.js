import path from 'path'
import glob from 'glob'
import matter from 'gray-matter'
import stringifyObject from 'stringify-object'
import { getOptions } from 'loader-utils'

// Loads markdown files with front matter and renders them into a layout.
// Layout can be set using the `layout` key in the front matter, and will map
// to a file name in the pages/layouts directory.
export default function(src) {
  const options = getOptions(this)

  // Parse the front matter
  const { content, data } = matter(src)

  // If no layout is provided, return the content directly.
  if (!data.layout) return content

  // Sometimes it's important to know the file path within the layout, we add this
  // as a special prop to the front matter, __resourcePath.
  const resourcePath = this.resourcePath.replace(
    path.join(this.rootContext, 'pages'),
    ''
  )

  // Layouts are always resolved from "pages/layouts" for consistency.
  const layoutPath = path.resolve(options.dir, 'pages/layouts', data.layout)

  // If the layout doesn't exist, throw a descriptive error
  // We use glob to check for existence, since the file could have multiple page
  // extensions depending on the config
  const layoutMatcher = `${layoutPath}.+(${options.config.pageExtensions.join(
    '|'
  )})`
  if (!glob.sync(layoutMatcher).length) {
    throw new Error(
      `File "${resourcePath}" specified "${
        data.layout
      }" as its layout, but no matching file was found at "${layoutMatcher}"`
    )
  }

  // Import the layout, export the front matter and layout-wrapped content
  return `import layout from '${layoutPath}'

export const frontMatter = ${stringifyObject({
    ...data,
    __resourcePath: resourcePath
  })}

export default layout({ ...frontMatter })

${content}
`
}
