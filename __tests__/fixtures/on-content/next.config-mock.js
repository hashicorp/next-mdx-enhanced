/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

const withMdxEnhanced = require('../../..')

module.exports = (configFn) =>
  withMdxEnhanced({
    onContent: (mdxContent) => configFn(mdxContent),
  })()
