import { frontMatter as introData } from '../pages/docs/intro.mdx'
import { frontMatter as advancedData } from '../pages/docs/advanced.mdx'

export default function docsPageLayout({ children, frontMatter }) {
  return (
    <>
      <p>LAYOUT TEMPLATE</p>
      <h1>{frontMatter.title}</h1>
      <p>All frontMatter: {JSON.stringify(frontMatter)}</p>
      <p>
        Other docs: {introData.title}, {advancedData.title}
      </p>
      {children}
    </>
  )
}
