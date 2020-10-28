const path = require('path')
const crypto = require('crypto')

async function extendFrontMatter({
  content,
  frontMatter,
  phase,
  extendFm,
} = {}) {
  if (!extendFm || !extendFm.process) return {}
  if (extendFm.phase !== 'both' && extendFm.phase !== phase) return {}

  return extendFm.process(content, frontMatter)
}
module.exports.extendFrontMatter = extendFrontMatter

function generateFrontmatterPath(filePath, root) {
  const filePathNormalized = normalizeToUnixPath(filePath)
  const dirnameNormalized = normalizeToUnixPath(__dirname)

  return normalizeToUnixPath(
    path.join(
      root,
      '.next/cache/mdx-data',
      `${md5(filePathNormalized.replace(dirnameNormalized, ''))}.json`
    )
  )
}
module.exports.generateFrontmatterPath = generateFrontmatterPath

// md5 hash a string
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex')
}

function normalizeToUnixPath(str) {
  return str.replace(/\\/g, '/')
}
module.exports.normalizeToUnixPath = normalizeToUnixPath
