import { frontMatter as introData } from '../src/pages/docs/intro.mdx'
import { frontMatter as advancedData } from '../src/pages/docs/advanced.mdx'

export default frontMatter => {
  return function docsPageLayout({ children }) {
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
}
