const path = require('path')
const { generateFrontmatterPath } = require('./util')
const debug = require('debug')('next-mdx-enhanced')

// This plugin expects to be called as a function with nextjs' config options, so that it is
// aware of the project root and can calculate paths relative to it.
module.exports = function nextBabelWrapper(nextConfig, pluginOptions) {
  // The function it returns is the actual babel plugin
  return function frontMatterExtractionPlugin({ types: t }) {
    return {
      visitor: {
        ImportDeclaration(_path, state) {
          // if we're not looking at a .mdx file import, do nothing
          const importPath = _path.node.source.value
          if (
            !importPath.match(
              new RegExp(`\\.(${pluginOptions.fileExtensions.join('|')})$`)
            )
          )
            return

          // if there are no "frontMatter" imports, do nothing
          const frontMatterSpecifier = _path.node.specifiers.find((s) =>
            importsFrontMatter(s)
          )
          if (!frontMatterSpecifier) return

          debug(`start: extracting frontmatter for ${importPath}`)

          // front matter is extracted and written out by the loader to .next/frontMatter/<filePathHashed>
          // here, we're calculating the path
          const currentPath = state.file.opts.filename
          const frontMatterPath = generateFrontmatterPath(
            path.resolve(path.dirname(currentPath), importPath),
            nextConfig.dir
          )

          // now, we construct a new import statement
          const localName = frontMatterSpecifier.local.name
          const frontMatterImport = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(localName))],
            t.stringLiteral(frontMatterPath)
          )

          // ...and insert it after the current import
          _path.insertAfter([frontMatterImport])

          // then we remove the front matter specifier from the current import
          if (_path.node.specifiers.length === 1) {
            // if its the only specifier, we remove the entire import
            _path.remove()
          } else {
            _path.node.specifiers = _path.node.specifiers.reduce((acc, s) => {
              // otherwise, we only remove the frontMatter import specifier
              if (!importsFrontMatter(s)) acc.push(s)
              return acc
            }, [])
          }
          debug(`finish: extracting frontmatter for ${importPath}`)
        },
      },
    }
  }
}

function importsFrontMatter(specifier) {
  return specifier.imported
    ? specifier.imported.name === 'frontMatter'
    : specifier.local.name === 'frontMatter'
}
