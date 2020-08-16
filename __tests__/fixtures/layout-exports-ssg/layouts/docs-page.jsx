import { frontMatter as other } from '../pages/docs/intro.mdx'

export async function getStaticProps() {
  return { props: {} }
}

export default function docsPageLayout({ children, frontMatter }) {
  return (
    <>
      <p>LAYOUT TEMPLATE</p>
      <h1>{frontMatter.title}</h1>
      {children}
    </>
  )
}
