/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const withMdxEnhanced = require('../../..')

module.exports = withMdxEnhanced({
  extendFrontMatter: {
    process: (mdxContent, frontMatter) => {
      return {
        __outline: 'outline stuff',
        layout: 'docs-page',
        reversePath: frontMatter.__resourcePath.split('').reverse().join(''),
      }
    },
  },
})()
