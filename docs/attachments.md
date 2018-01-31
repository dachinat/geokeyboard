---
layout: default
---

# Attachments

You are attaching to your instances of `Geokeyboard` pre-defined extensions, which add to library functionality.

Attachments can be done globally (on every element that is bound to an instance), and specifically on desired elements.

> LocalStorage extension is always attached globally.

Existing extensions include

* `Geokeyboard.Select` - Select box integration
* `Geokeyboard.Checkbox`- Check-box integration
* `Geokeyboard.LocalStorage` - Local storage integration

To attach an extension globally to all selectors, you need to specify this in an initializer. Otherwise, you're using
an `.attach` method, which accepts `extension path` and `extension parameters`.


### Local Storage

Here's an example of adding
local storage extension to save last used mode and automatically apply on page-load:

```js
var geokb = new Geokeyboard('#input1', {
    globals: [
        [Geokeyboard.extensions.LocalStorage, {key: 'SOME_KEY'}], 
    ]
});
```

As you can see, you're assigning a `globals` property to instance parameters, which is an array of extensions.
Extensions themselves are arrays with two entries, *path to extension* and *property object*.