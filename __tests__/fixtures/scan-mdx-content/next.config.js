/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  scan: {
    hasSnargles: {
      pattern: /<Snargles.*.*\/>/,
    },
    snarglesName: {
      pattern: /<Snargles.*name=['"](.*)['"].*\/>/,
      transform: (arr) => arr[1], // An optional callback function that transforms the result of the match operation
    },
  },
})()
