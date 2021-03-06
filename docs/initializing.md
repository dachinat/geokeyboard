---
layout: default
permalink: initializing
---

# Initiating a constructor

After having a source of library included, it's good time to initiate a class constructor:

```js
var geokb = new Geokeyboard;
```

`Geokeyboard` constructor accepts three optional arguments: `string` of `selectors` (i.e.: '#text-input1, #text-input2',
or '.text-inputs'), `object` of `global options` for an instance, and an `object` of `options for specified selectors`.

If you pass no arguments to this constructor, you will need to use `.listen` method, which accepts `selectors` and
`selector-specfic` options, otherwise there will be no effect.

Assuming you're having a text input:

```html
<input type="text" id="input1" />
```

Calling

```js
new Geokeyboard('#input1');
```

and

```js
var geokb = new Geokeyboard;
geokb.listen('#input1');
```

produce same results.

<a href="https://jsfiddle.net/dachinat/cxtpfeb9/" target="_blank">Have a look at examples of initializing.</a>

Default options for an instance are:

```js
{
    hotSwitchKey: 96, // Keyboard shortcut to switch languages (~)
    change: null, // Function to call when any of elements bound to instance change
    globals: [], // Geokeyboard extensions to attach to every bound element (i.e.: checkbox)
}
```

<a href="https://jsfiddle.net/dachinat/uz98v7y9/" target="_blank">JSFiddle example on passing parameters.</a>

Let's continue documenting with <a href="{{site.baseurl}}/listeners.html">Listeners overview.</a>