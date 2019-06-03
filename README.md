# Next.js + MDX Enhanced

Have you ever found yourself using [Next.js](https://github.com/zeit/next.js) with [mdx](https://mdxjs.org) but craving the ability to use layouts for full mdx pages, and/or [front matter](https://jekyllrb.com/docs/front-matter/)? Well well my friend, you are in the right place, because that's exactly what this plugin will do for you! 🌟

## Installation

Start with `npm i next-mdx-enhanced`. You can then instantiate it as a Next.js plugin as such:

```js
// next.config.js
const withMdxEnhanced = require('next-mdx-enhanced')

module.exports = withMdxEnhanced(/* options, see below */)(/* your normal nextjs config */)
```

Also, make sure to add `.mdx-data` to your `.gitignore` file, this is a directory generated as part of the optimization process for this plugin.

## Usage

Let's get right into an example. Say you have set up the plugin as above, and you have site for displaying some docs (or blog, etc) that you're working on that looks like this:

```
MyApp
├─ pages
│  ├ index.jsx
│  └ docs
│    ├ intro.mdx
│    └ advanced.mdx
└ next.config.js
```

You need a couple things here in order to get to reasonable functionality.

1. The `.mdx` must each render as a page
2. The `.mdx` pages must render within your site's common layout
3. You need to be able to create an index of each of the pages for easy navigation

The default mdx nextjs plugin takes care of point number one, but nothing else. This one knocks out all three. Let's get into how it's done.

### Start with a Layout

Let's kick it off with covering the second point: layouts. We can specify a layout for a given `.mdx` file using its front matter, as such:

```
---
layout: 'docs-page'
title: 'Intro Page'
---

Here's some *markdown* content!
```

When the plugin sees the `layout` key, it will go looking by default in `/layouts/{name}` -- so in this case, it will look for `/layouts/docs-page` -- the extension can be any of the [pageExtensions](https://nextjs.org/docs#configuring-extensions-looked-for-when-resolving-pages-in-pages) you have configured. In this case, let's just use `.jsx`. Running this code will give you an error that the layout file was not found, so let's create it:

```diff
MyApp
├─ pages
│  ├ index.jsx
│  └ docs
│    ├ intro.mdx
│    └ advanced.mdx
+├─ layouts
+│  └ docs-page.jsx
└ next.config.js
```

And for the content of your layout, nice and easy:

```jsx
export default frontMatter => {
  return ({ children }) => {
    return (
      <div>
        <h1>{frontMatter.title}</h1>
        {children}
      </div>
    )
  }
}
```

In this case, all front matter is passed in to the default export function as a javascript object, so here we use the page title to display at the top in an `h1`. The contents of the markdown file are passed in as `children` from the returned function, so wherever we drop `{children}` the markdown file contents will render.

Now after restarting, the page should render within your layout. Whoo!

There are some additional config options here, let's take a look:

```js
mdxEnhanced({
  layoutsPath: 'somePath/otherPath',
  defaultLayout: true,
  remarkPlugins: [], // Array of remark plugins -- https://mdxjs.com/advanced/plugins#using-remark-and-rehype-plugins
})
```

I mentioned earlier that this plugin looks in `/layouts` -- you are welcome to change this via the option above. Whatever you pass in will be resolved relative to the project root. Additionally, toggling `defaultLayout` to `true` will make the plugin look for an `index.[extension]` layout file within the `layoutsPath` and use this for any `.mdx` file that a layout has not been specified for. This can help to save repetition if most of your pages implement the same layout.

### On to Front Matter

So, you now have mdx files rendering as pages within custom layouts, and this is amazing. But how do your users get to these pages? They will have to start with an "index page" of some sort. And often times, it's useful to give users the opportunity to navigate between pages within your layout. Let's set up both of these.

Remember this file tree?

```
MyApp
├─ pages
│  ├ index.jsx
│  └ docs
│    ├ intro.mdx
│    └ advanced.mdx
├─ layouts
│  └ docs-page.jsx
└ next.config.js
```

Let's head over to the `index.jsx` page and make that our entry point.

```jsx
import Link from 'next/link'
import {frontMatter as introData} from './docs/intro.mdx'
import {frontMatter as advancedData} from './docs/advanced.mdx'

export default () => {
  return (<>
    <h1>Docs Index<h1>
    <ul>
      <li><Link href={formatPath(introData.__resourcePath)}><a>{introData.title}</a></Link></li>
      <li><Link href={formatPath(advancedData.__resourcePath)}><a>{advancedData.title}</a></Link></li>
    </ul>
  </>)
}

function formatPath(p) {
  return p.replace(/\.mdx$/, '')
}
```

There's a bit to parse here so let's take it step by step.

```jsx
import { frontMatter as introData } from './docs/intro.mdx'
import { frontMatter as advancedData } from './docs/advanced.mdx'
```

Here, we import _just the front matter_ from the file we want. We don't need the full docs, we just want to know the title and location so we can link to it. We do the same for both files in our docs. You can probably imagine this would become a little bit of a pain as more docs files are added. I'd recommend [this babel plugin](https://github.com/jescalan/babel-plugin-import-glob-array) to make it easier. Let's see how the code looks after a quick refactor using this plugin:

```jsx
import Link from 'next/link'
import {frontMatter} from './docs/*.mdx'

export default () => {
  return (<>
    <h1>Docs Index<h1>
    <ul>
      {frontMatter.map(page => {
        <li><Link href={formatPath(page.__resourcePath)}><a>{page.title}</a></Link></li>
      })}
    </ul>
  </>)
}

function formatPath(p) {
  return p.replace(/\.mdx$/, '')
}
```

...much better. And now all we need to do to add a page is to put it in the docs folder. Let's keep going:

```jsx
<li>
  <Link href={formatPath(page.__resourcePath)}>
    <a>{page.title}</a>
  </Link>
</li>
```

The only thing that should seem unfamiliar here is `__resourcePath` -- this is a special variable that is injected into the front matter for each file, which exposes the path of the file the front matter came from, relative to the root of your project. So the small `formatPath` function below formats the path as a link to its location that we can pass to nextjs' `<Link>` component.

And you can do the same thing in your layout file in order to allow easy links to other docs pages if needed.

> _Nerd Note:_ If you're a real sharp thinker, you may have noticed that it is seemingly impossible for this previous statement to be true, since importing a mdx file requires rendering into its layout, but its layout also requires all the other mdx files, which each require rendering into their layouts, etc. This is what some may call an infinite loop, and it is impossible. In reality, this plugin does a little dirty work under the hood to make this behavior possible. It also injects a babel plugin which extracts the front matter out to separate temporary files, then transforms any front matter imports into importing from the separate file, which breaks the loop.
