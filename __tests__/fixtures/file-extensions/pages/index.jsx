import { frontMatter as mdExtension } from './test.md'
import { frontMatter as mdxExtension } from './test.mdx'

export default () => {
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
