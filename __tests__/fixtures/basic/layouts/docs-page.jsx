/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { frontMatter as introData } from '../pages/docs/intro.mdx'
import { frontMatter as advancedData } from '../pages/docs/advanced.mdx'

export default function docsPageLayout({ children, frontMatter }) {
  return (
    <>
      <p>LAYOUT TEMPLATE</p>
      <h1>{frontMatter.title}</h1>
      <p>
        Other docs: {introData.title}, {advancedData.title}
      </p>
      {children}
    </>
  )
}
