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

To attach an extension globally to all selectors, you need to specify this in an initializer:
 
```js
new Geokeyboard('#input1', {
    globals: [
        [Geokeyboard.extensions.Select, {select: '#select1'}]
    ]
})
```
 
Otherwise, you're using an `.attach` method, which accepts `extension path`, `selectors` and `extension parameters`:

```js
geokb.attach(Geokeyboard.extensions.Select, '#input1', {
    select: '#select1'
});
```

### Checkbox extension

Checkbox extension can be used globally (on all selectors of an instance) and locally (on specific selectors).

```html
<input type="text" id="input1" />
<input type="text" id="input2" />
<input type="checkbox" id="checkbox1" />
```

#### Global checkbox

```js
new Geokeyboard('#input1', {
    globals: [
        [Geokeyboard.extensions.Checkbox, {checkbox: '#checkbox1'}]
    ]
}).listen('#input2');
```

<a href="https://jsfiddle.net/dachinat/pg23g52t/" target="_blank">JSFiddle example</a>

#### Local checkbox

```js
new Geokeyboard('#input1')
  .listen('#input2')
  .attach(Geokeyboard.extensions.Checkbox, '#input1', {
      checkbox: '#checkbox1'
  });
```

<a href="https://jsfiddle.net/dachinat/smwg2q1v/" target="_blank">JSFiddle example</a>

### Select extension

Select extension is very similar to `Checkbox` extension. You need to add two options with `true` and `false` values.
True stands for mode where text transformation is being done to Georgian.

```html
<input type="text" id="input1" />
<input type="text" id="input2" />
<select id="select1">
    <option>Choose language</option>
    <option value="true">Georgian</option>
    <option value="false">English</option>
</select>
```

#### Global select

```js
new Geokeyboard('#input1', {
    globals: [
        [Geokeyboard.extensions.Select, {select: '#select1'}]
    ]
}).listen('#input2');
```

<a href="https://jsfiddle.net/dachinat/jmqffyk2/" target="_blank">JSFiddle example</a>

#### Local select

```js
new Geokeyboard('#input1')
  .listen('#input2')
  .attach(Geokeyboard.extensions.Select, '#input1', {
      select: '#select1'
  });
```
<a href="https://jsfiddle.net/dachinat/ep9vyose/" target="_blank">JSFiddle example</a>

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

<a href="https://jsfiddle.net/dachinat/t219k4j4/" target="_blank">JSFiddle example</a>

As you can see, you're assigning a `globals` property to instance parameters, which is an array of extensions.
Extensions themselves are arrays with two entries, *path to extension* and *property object*.