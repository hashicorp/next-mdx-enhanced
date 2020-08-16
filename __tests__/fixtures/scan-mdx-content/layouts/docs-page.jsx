import { frontMatter as introData } from '../pages/docs/intro.mdx'
import { frontMatter as advancedData } from '../pages/docs/advanced.mdx'

export default function docsPageLayout({ children, frontMatter }) {
  const __scans = frontMatter.__scans
  return (
    <>
      {/* Similar to adding a script to document <head/> we load a font stylesheet here vs. running arbitrary JS */}
      {__scans.hasSnargles && (
        <link
          href="https://fonts.googleapis.com/css?family=Press+Start+2P"
          rel="stylesheet"
        />
      )}

      <h1 style={{ fontFamily: "'Press Start 2P'" }}>{frontMatter.title}</h1>
      <h2 style={{ fontFamily: "'Press Start 2P'" }}>
        Should render in 8-bit font because...
      </h2>
      {__scans.hasSnargles && <h1>We found snargles</h1>}

      {__scans.snarglesName && <h1>{__scans.snarglesName}</h1>}
      <p>
        Other docs: {introData.title}, {advancedData.title}
      </p>
      {children}
    </>
  )
}
