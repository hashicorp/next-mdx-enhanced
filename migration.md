# Questions

This document needs to be cleaned but I thought this might be better than an infinate issue thread 😉

## General
- I see a lot of `fs` usage in the [with-mdx-remote example](https://github.com/vercel/next.js/tree/canary/examples/with-mdx-remote)
  should this worry me? (as far as I know this is not a browser-supported package and only works locally)
  
- I cannot even run the [with-mdx-remote example](https://github.com/vercel/next.js/tree/canary/examples/with-mdx-remote) example what should I do?
  
  My steps & issue:
  ```
  gh clone vercel/next.js   # uses the github cli
  cd next.js/examples/with-mdx-remote
  yarn  # install dependencies
  yarn add --dev eslint eslint-config-next  # to be able to use nextjs 11
  yarn build  # 👈 Exception time
  ```
  
  The exception:
  ```
  yarn run v1.22.4
  $ next build
  info  - Using webpack 5. Reason: Enabled by default https://nextjs.org/docs/messages/webpack5
  info  - Checking validity of types
  
  > Build error occurred
  Error: Failed to load plugin 'jest' declared in '..\..\.eslintrc.json#overrides[0]': Cannot find module 'eslint-plugin-jest'
  Require stack:
  - C:\workspace\next.js\__placeholder__.js
  Referenced from: C:\workspace\next.js\.eslintrc.json
      at Function.Module._resolveFilename (internal/modules/cjs/loader.js:885:15)
      at Function.resolve (internal/modules/cjs/helpers.js:94:19)
      at Object.resolve (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\shared\relative-module-resolver.js:28:50)
      at ConfigArrayFactory._loadPlugin (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\config-array-factory.js:1017:39)
      at ConfigArrayFactory._loadExtendedPluginConfig (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\config-array-factory.js:837:29)
      at ConfigArrayFactory._loadExtends (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\config-array-factory.js:779:29)
      at ConfigArrayFactory._normalizeObjectConfigDataBody (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\config-array-factory.js:720:25)
      at _normalizeObjectConfigDataBody.next (<anonymous>)
      at ConfigArrayFactory._normalizeObjectConfigData (C:\workspace\next.js\examples\with-mdx-remote\node_modules\@eslint\eslintrc\lib\config-array-factory.js:665:20)
      at _normalizeObjectConfigData.next (<anonymous>) {
    type: 'Error',
    code: 'MODULE_NOT_FOUND',
    requireStack: [ 'C:\\workspace\\next.js\\__placeholder__.js' ],
    messageTemplate: 'plugin-missing',
    messageData: {
      pluginName: 'eslint-plugin-jest',
      resolvePluginsRelativeTo: 'C:\\workspace\\next.js',
      importerName: '..\\..\\.eslintrc.json#overrides[0]'
    }
  }
  error Command failed with exit code 1.
  info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
  ```
  
  (and running `yarn add --dev eslint-plugin-jest` doesn't change the issue).
  
## Migration

### Replacing the library itsself
1. Remove the line with `next-mdx-enhanced` from your `package.json` file
2. Run `yarn add next-mdx-remote` or `npm i next-mdx-remote` (depending on your preference.)

### Modifying `next.config.js`

With next-js-enhanced your `next.config.js` file will look something like this:
```js
const withMdxEnhanced = require('next-mdx-enhanced');
/* other imports */

module.exports = withMdxEnhanced({
  /* Your next-mdx-enhanced config*/
})({
  /* Your next.js config */
})
```

`next-mdx-remote` doesn't have a similar wrapping of the next.js config. Therefore you can simply replace this with something like the following.

```js
/* possibly some remaining imports */
module.export = {
    /* Your next.js config */
}
```
(You'll probably want the next-mdx-enhanced config later though to so some more configuration) 

[//]: <> (TODO figure out the exact place to put the config)

### Other stuff
- Step 1: (I guess) move md files from /pages to /posts 
- ...

### First real migration questions
- What is the equivalent of mdx-enhanced's layouts in mdx-remote
