---
layout: default
---

# Getting started

Before writing any code specific to this library, you need to include one of the bundled versions.

Repository contains `dist/` directory, where you'll find different versions.

> You will need only one out of those files.

* `geokeyboard.js` - Unminified bundled library without polyfills
* `geokeyboard.dev.js` - Development version which you won't use in production
* `geokeyboard.min.js` - Minified library wihtout polyfills
* `geokeyboard.min.pf.js` - Minified version that includes polyfills (Best for compatibility with old browsers)

In this example we're including minified version with polyfills (put this code before closing body tag):

```html
<script src="./dist/geokeyboard.min.pf.js"></script>
```

Alternatively, you can include `Geokeyboard` via CDN and download no files from the repo:

```html
<script src="https://cdn.rawgit.com/dachinat/geokeyboard/{{site.github.build_revision}}/dist/geokeyboard.min.pf.js"></script>
```

Right after above examples you will have access to `Geokeyboard` object. Which you'll need to initiate with `new`
keyword.

```js
geokb = new Geokeyboard;
```

See an <a href="https://jsfiddle.net/dachinat/xwafbrvu/" target="_blank">an example on JSFiddle.</a>

Go head to <a href="/initializing.html">Initializing a constructor</a> to continue with this guide.