export default meta => {
  return function docsPageLayout({ children }) {
    return (
      <>
        <p>LAYOUT TEMPLATE</p>
        <h1>{meta.title}</h1>
        {children}
      </>
    )
  }
}
