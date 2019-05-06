# Proposal: Next Prebuild Plugin

There are a few situations where you need to run some processing before webpack does its thing. For example, the `next-mdx-enhanced` plugin pre-processes markdown files, extracts the front matter, and rewrites import paths to make for a smooth developer experience. It could not extract the front matter in a webpack loader, as all front matter must be able to be required to the first file webpack touches. If it has not yet extracted the front matter but already needs to resolve the path it has been extracted to, it will error.

Another use case is in the `next-data-preload` plugin, which can run data-fetching queries at build time and embed them into your bundles when you are exporting a static site. It uses a similar method to the above, where it runs the queries and writes out the results into a separate file, removing the original query and pointing the variable to the file import.

Effectively, whenever you want to do additional optimization by evaluating certain files and writing out external files that can be imported to get the optimized data, this step must happen before webpack begins resolving dependencies. This plugin provides a smooth, optimized interface for adding logic that runs before webpack starts running, and still integrates smoothly into production builds and local development.

## Installation

Install the plugin with: `npm i @hashicorp/next-prebuild`
Now add it to your `next.config.js` as such:

```js
const withPrebuild = require('@hashicorp/next-prebuild')

module.exports = withPrebuild(
  (nextConfig, compiler, compilation) => {
    console.log('do what you need here, return a promise if its async')
  },
  {
    /* other next.js configuration */
  }
)
```

## Usage

This plugin works especially well when bundled into other plugins that ship out specific optimizations, it's not as common to be used straight up in a developer-facing nextjs config. That being said, you can use it where and how you like! The plugin expects to be a function, which is called with three parameters:

- `nextConfig`: the full next.js config object as seen after all plugins have done their thing
- `compiler`: straight from webpack, contains a lot of data
- `compilation`: straight from webpack, contains a lot of data

Prebuild can be seen as a webpack plugin, since it actually is behind the scenes, and exposes the compiler and compilation objects. Using these objects, you can [hook into webpack's build process](https://webpack.js.org/api/compilation-hooks/) on a somewhat limited basis. The sky's the limit with what you can do here.
