const path = require('path')
const crypto = require('crypto')

module.exports.extendFrontMatter = async function extendFrontMatter({
  content,
  phase,
  extendFm,
} = {}) {
  if (!extendFm || !extendFm.process) return {}
  if (extendFm.phase !== 'both' && extendFm.phase !== phase) return {}

  return extendFm.process(content)
}

module.exports.generateFrontmatterPath = function generateFrontmatterPath(
  filePath,
  root
) {
  return path.join(root, `.mdx-data/${md5(filePath)}.json`)
}

// md5 hash a string
function md5(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
}
