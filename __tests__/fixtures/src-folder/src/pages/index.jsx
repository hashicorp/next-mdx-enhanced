/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { frontMatter as introData } from './docs/intro.mdx'
import { frontMatter as advancedData } from './docs/advanced.mdx'

export default () => {
  return (
    <>
      <p>Hello world</p>
      <ul>
        <li>{introData.title}</li>
        <li>{advancedData.title}</li>
      </ul>
    </>
  )
}
