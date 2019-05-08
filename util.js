const crypto = require('crypto')
const path = require('path')

function generateFrontmatterPath(filePath, nextConfig) {
  return path.join(
    nextConfig.dir,
    `.next/__mdx-front-matter/${md5(filePath)}.json`
  )
}

function md5(str) {
  return crypto
    .createHash('md5')
    .update(str)
    .digest('hex')
}

module.exports = {
  generateFrontmatterPath
}
