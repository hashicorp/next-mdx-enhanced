const path = require('path')
const crypto = require('crypto')

module.exports.generateFrontmatterPath = function generateFrontmatterPath(
  filePath,
  nextConfig
) {
  return path.join(nextConfig.dir, `.mdx-data/${md5(filePath)}.json`)
}

// md5 hash a string
function md5(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
}
