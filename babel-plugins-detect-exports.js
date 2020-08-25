module.exports = function babelWrapper(metadata) {
  return function frontMatterExtractionPlugin({ types: t }) {
    return {
      visitor: {
        // If a layout file exports data fetching methods, we add this to a `metadata`
        // object that is shared with the loader so that the loader can also export them.
        ExportDeclaration(_path) {
          if (_path.node.type === 'ExportNamedDeclaration') {
            metadata.push(_path.node.declaration.id.name)
          }
        },
      },
    }
  }
}
