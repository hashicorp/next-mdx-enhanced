import { frontMatter as other} from '../pages/docs/intro.mdx'

export function unstable_getStaticProps() {
  return {}
}

export default (frontMatter) => {
  return function docsPageLayout({ children }) {
    return (
      <>
        <p>LAYOUT TEMPLATE</p>
        <h1>{frontMatter.title}</h1>
        {children}
      </>
    )
  }
}