---
layout: default
permalink: listeners
---

# Listeners

If you won't use `.listen` method on an instance, then you'll need to specify selectors to a class constructor:

```js
var geokb = new Geokeyboard('#input1, #input2');
``` 

Above code starts listening to those two elements automatically.

You can call `.listen` on an instance later and also chain on it:

```js
geokb.listen('#input3, #input4').listen('#input5');
```

Default options for selectors are:

```js
{
    replaceOnType: true, // If transformation to Georgian is enabled or not
    replaceOnPaste: false, // If pasted text should be processed to Georgian
    hotSwitch: true, // If language switch is supported for an element or not
    change: null, // Function to call when an element gets changed
}
```

In following example, we are having non-Georgian letters initially on first input, and turn off hot switch on the second
element:

```js
new Geokeyboard('#input1', {}, {
    replaceOnType: false
}).listen('#input2', {
    hotSwitch: false
});
```

<a href="https://jsfiddle.net/dachinat/mn8aj36b/" target="_blank">See an example at JSFiddle.</a>

Having a reference to instance variable, you can call `.listen` to add selectors, or change options for existing
selectors anytime in your code.

Next, we're going to explore <a href="{{site.baseurl}}/attachments.html">Extension attachments.</a>