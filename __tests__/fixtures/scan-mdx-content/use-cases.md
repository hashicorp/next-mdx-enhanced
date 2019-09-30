# Head Tag Customization

Let's assume you want to support some external content feature such as a dynamic social media feed, photo or video embed, or some other interesting vendor-provided feature that would usually require

1. A bit of HTML markup
2. A vendor-provided script

A good place for this script would likely be within the HTML document `<head>` or near the closing `</body>` - both of which will need to be handled by your `Layout` component if you're building an `MDX`-driven page.

`MDX` Page

```mdx
---
layout: 'docs-page'
title: 'Intro Docs'
---

import EmbeddedContentFeed from '../../components/EmbeddedContentFeed'

Here's some _introductory_ docs content

<EmbeddedContentFeed /> // outputs <div data-id="foo" data-vendor-xyz-property="bar"></div>
```

`next.config.js`

```js
module.exports = withMdxEnhanced({
  scan: {
    hasEmbeddedContentFeed: {
      pattern: /<EmbeddedContentFeed.*\/>/
    }
  }
})()
```

The plugin returns `__scans : { hasEmbeddedContentFeed: ['/<EmbeddedContentFeed \/>/'] }`

This can be used in the `Layout` component to conditionally load the script

```jsx
export default plugIn => {
  const __scans = plugIn.__scans
  return function docsPageLayout({ children }) {
    return (
   <>
      <Head>
        {__scans.hasEmbeddedContentFeed && (
          <script  src="//vendor.com/embed.js" ></script>
        )}
     </Head>
//....
```
