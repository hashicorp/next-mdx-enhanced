# Next.js + MDX Enhanced

[![build status](https://img.shields.io/circleci/build/github/hashicorp/next-mdx-enhanced.svg?style=flat-square)](https://circleci.com/gh/hashicorp/next-mdx-enhanced)

Are you using [Next.js](https://github.com/zeit/next.js) with [MDX](https://mdxjs.com) and wanted layouts and [front
matter](https://jekyllrb.com/docs/front-matter/)? That's exactly what this plugin will do for you! 🌟

> ⚠️ You probably should be using [next-mdx-remote](https://github.com/hashicorp/next-mdx-remote) instead of this library. It is ~50% faster, more flexible with content storage, does not induce memory issues at scale, and fits much better with the way that data is intended to flow through next.js.

For example, if have a site that displays content (e.g. documentation) that looks like:

```
MyDocsApp
├─ pages
│  ├ index.jsx
│  └ docs
│    ├ intro.mdx
│    └ advanced.mdx
├─ layouts
│  └ docs-page.jsx
└ next.config.js
```

And you want the following:

| feature                                                  | next-mdx-enhanced | @next/mdx |
| -------------------------------------------------------- | ----------------- | --------- |
| MDX files render as a navigable page                     | ✅                | ✅        |
| MDX files render with a common layout                    | ✅                | ❌        |
| An index page that contains a navigable link to each MDX | ✅                | ❌        |

## Installation

Install the package:

```shell
$ npm install next-mdx-enhanced
```

## Usage & Options

Open the `next.config.js` file and instantiate it as a Next.js plugin:

```js
// next.config.js
const withMdxEnhanced = require('next-mdx-enhanced')

module.exports = withMdxEnhanced({
  layoutPath: 'layouts',
  defaultLayout: true,
  fileExtensions: ['mdx'],
  remarkPlugins: [],
  rehypePlugins: [],
  usesSrc: false,
  extendFrontMatter: {
    process: (mdxContent, frontMatter) => {},
    phase: 'prebuild|loader|both',
  },
  reExportDataFetching: false,
})(/* your normal nextjs config */)
```

### layoutPath

> `string` | optional | **default: `layouts`**

The directory used to resolve the page layout when `layout` key present in MDX front matter. Value is resolved relative to project root.

### defaultLayout

> `boolean` | optional

Set value to `true` to treat `index.[extension]` within `layoutPath` as the default layout for any `.mdx` file that a layout has not been specified for.

### fileExtensions

> `array` | optional | **default: `['mdx']`**

Array of file extensions that should be processed as MDX pages.

### remarkPlugins

> `array` | optional

Array of [remark plugins](https://mdxjs.com/advanced/plugins#using-remark-and-rehype-plugins) used to transform `.mdx` files.

### rehypePlugins

> `array` | optional

Array of [rehype plugins](https://mdxjs.com/advanced/plugins#using-remark-and-rehype-plugins) used to transform `.mdx` files.

### usesSrc

> `boolean` | optional | **default: `checks for src/pages to set the flag`**

It dictates if next mdx enhanced should use the src/pages for looking for the pages' folder. Otherwise, it will use the pages in the top-level directory. Also, if not set, it automatically checks for the src/pages directories.

### extendFrontMatter

> `object` | optional

| Property  | Type       | Description                                                                                                                                                                                                                  |
| --------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `process` | `function` | A hook function whose return value will be appended to the processed front matter. This function is given access to the source `.mdx` content as the first parameter and the processed front matter as the second parameter. |
| `phase`   | `string`   | Used to specify when to run the `process` function. Eligible values are `prebuild`, `loader`, `both`. Defaults to `both` if not specified.                                                                                   |

### scan

> `object` | optional

Object of scan objects containing the following parameters

| Property    | Type                                       | Description                                                                                                                                                                                                                                                                                                                                          |
| ----------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pattern`   | `RegEx`                                    | A RegEx to use for scanning `.mdx` content, enables Layout customization                                                                                                                                                                                                                                                                             |
| `transform` | `function(match: Array[]): any` _optional_ | An optional callback function that transforms the result of the match operation. This function is passed an Array of any matching `.mdx` content that is returned by [`content.match(pattern)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match#Return_value) operation utilizing the `pattern` RegEx. |

See ["Scanning MDX Content"](#scanning-mdx-content) for more details.

### onContent

> `function(mdxContent)` | optional

This function runs on each build of an MDX page. All metadata and full text content are passed to this function as its only argument.

> Useful for indexing your content for site search or any other purpose where
> you'd like to capture content on build.

### reExportDataFetching

> `boolean` | optional

If you export `getStaticProps` and/or `getServerSideProps` from your layout, and wish for those to be re-exported from each of your mdx pages, set this option to `true`.

## Layouts

Each MDX file may define the name of layout within its front matter.

Given an MDX page named `pages/docs/intro.mdx`:

```
---
layout: 'docs-page'
title: 'Introduction'
---

Here's some *markdown* content!
```

This loads the content within the layout defined at:

```
MyDocsApp
...
└─ layouts
   └ docs-page.jsx # SEE supported extensions below
...
```

The plugin's `layoutPath` option defaults to `layouts`.

The file extension of the template must be one of configured [pageExtensions](https://nextjs.org/docs#configuring-extensions-looked-for-when-resolving-pages-in-pages).

The template, defined in `layouts/docs-page.jsx`, looks like the following:

```jsx
// This function must be named otherwise it disables Fast Refresh.
export default function DocsPage({ children, frontMatter }) {
  // React hooks, for example `useState` or `useEffect`, go here.
  return (
    <div>
      <h1>{frontMatter.title}</h1>
      {children}
    </div>
  )
}
```

The default export function receives the front matter object, `frontMatter`, as a parameter. This function returns a rendering function. The rendering function receives an object that contains the the page content as `children` that is [destructured and reassigned](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) to `content`.

## Front Matter

The front matter can be imported into your index pages and your templates. This enables you to create index pages or provide navigation across all your pages.

### Create an index page

Given an index page named `pages/index.jsx`:

```
MyDocsApp
├─ pages
│  ├ index.jsx
│  └ docs
│    ├ intro.mdx
│    └ advanced.mdx
├─ layouts
│  └ docs-page.jsx
└ next.config.js
```

With the content:

```jsx
import Link from 'next/link'
import { frontMatter as introData } from './docs/intro.mdx'
import { frontMatter as advancedData } from './docs/advanced.mdx'

export default function DocsPage() {
  const docsPages = [introData, advancedData]

  return (
    <>
      <h1>Docs Index</h1>
      <ul>
        {docsPages.map((page) => (
          <li key={page.__resourcePath}>
            <Link href={formatPath(page.__resourcePath)}>
              <a>{page.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function formatPath(p) {
  return p.replace(/\.mdx$/, '')
}
```

This creates an index page of all the MDX pages found within `docs`.

Let's examine the contents of the index page step-by-step:

```jsx
import { frontMatter as introData } from './docs/intro.mdx'
import { frontMatter as advancedData } from './docs/advanced.mdx'
```

First, the index page imports the destructured and renamed front matter from each of the docs pages. The front matter contains the title and location.

> Don't repeat yourself: As the number of MDX pages grows, importing each front
> matter creates more maintenance that can be relieved by
> [babel-plugin-import-glob-array](https://github.com/jescalan/babel-plugin-import-glob-array).
> This plugin would enable you to specify this replacement those two imports
> with this file glob pattern: `import {frontMatter as docsPages} from './docs/*.mdx'`

Let's examine the code that renders each link:

```jsx
export default function DocsPage() {
  const docsPages = [introData, advancedData]

  return (
    <>
      <h1>Docs Index</h1>
      <ul>
        {docsPages.map((page) => (
          <li key={page.__resourcePath}>
            <Link href={formatPath(page.__resourcePath)}>
              <a>{page.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}

function formatPath(p) {
  return p.replace(/\.mdx$/, '')
}
```

The `__resourcePath` is a property that stores the relative path to the MDX file and is automatically included in the front matter. The helper function `formatPath` strips the file extension to create a well-formed path to give to the NextJS `<Link>` component.

> Performance tip: A description or summary field could be added to the front
> matter to keep the import small while enabling the index page to give a
> preview of the content.

This same procedure can also be done for layout files.

> Implementation note: This plugin injects a babel plugin that extracts the
> front matter to temporary files. This removes the circular dependency created
> when a template imports a MDX page that imports that same template.

## Scanning MDX Content

Sample `next.config.js` entry:

```js
// in next.config.js
withMdxEnhanced({
  scan: [
    {
      someImportantKey: {
        pattern: /<SomeComponent.*name=['"](.*)['"].*\/>/,
        transform: (arr) => arr[1], // Optionally get a specific value back via a function;
        // if `transform` is omitted, any and all matches will be returned in an array
      },
    },
  ],
})
```

If an MDX page uses `<SomeComponent />`

```js
---
layout: 'docs-page'
title: 'Advanced Docs'
---

import SomeComponent from '../../components/SomeComponent'

This is some _really_ **advanced** docs content!

<SomeComponent name="Find this text" />
```

This will produce an array of matches returned to your layout by the plugin.

```js
__scans: {
  someImportantKey: ['Find this text']
}
```

Consume these values in the layout with the `__scans` key that is passed in attached to the front matter data.

```jsx
export default function layoutWrapper(frontMatter) {
  const __scans = frontMatter.__scans
  return function Layout({ children }) {
    return (
   <>
    {/*..begin Layout..*/}
        {__scans.someImportantKey && (
          <h1>{__scans.someImportantKey}</h1> // returns <h1>Find this text</h1>
        )}
    {/*..end Layout..*/}
  </>

```

For more reference and an example use case please see the [`/scan-mdx-content/`](https://github.com/hashicorp/next-mdx-enhanced/tree/master/__tests__/fixtures/scan-mdx-content) test.
