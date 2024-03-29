/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { frontMatter as mdExtension } from './test.md'
import { frontMatter as mdxExtension } from './test.mdx'

export default function Page() {
  return (
    <>
      <p>
        md: <span>{mdExtension.extension}</span>
      </p>
      <p>
        mdx: <span>{mdxExtension.extension}</span>
      </p>
    </>
  )
}
