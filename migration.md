# Questions

This document needs to be cleaned but I thought this might be better than an infinate issue thread 😉

## General FAQ
- I see a lot of `fs` usage in the [with-mdx-remote example](https://github.com/vercel/next.js/tree/canary/examples/with-mdx-remote)
  should this worry me? (as far as I know this is not a browser-supported package and only works locally)
  - No, any imports used in `getStaticProps` are executed in a node environment at build time and removed from client side output. The [nextjs docs](https://nextjs.org/docs/basic-features/data-fetching#getstaticprops-static-generation) can offer more detail on this.
  
- I cannot even run the [with-mdx-remote example](https://github.com/vercel/next.js/tree/canary/examples/with-mdx-remote) example what should I do? 
  - At this point (28-06-2021) the example runs if you disable eslint in next.config.js. The error message should contain the method to do this.
  
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

`next-mdx-remote` doesn't have a similar wrapping of the next.js config. Therefore, you can simply replace this with something like the following.

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
