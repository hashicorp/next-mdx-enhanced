import { frontMatter as introFm } from '../pages/docs/intro.mdx'

export default frontMatter => {
  return function docsPageLayout({ children }) {
    return (
      <>
        <p>LAYOUT TEMPLATE</p>
        <h1>{frontMatter.title}</h1>
        <p>Other docs: {introFm.title}</p>
        {children}
      </>
    )
  }
}
