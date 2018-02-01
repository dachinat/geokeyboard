---
layout: default
---

# Change callbacks

Sometimes you'll need to perform specific actions when an element becomes active/inactive with Geokeyboard.

### When specific selector(s) get changed

In this case you need to provide `change` option (a function that receives current state as its first argument) to
selector configuration. This is a third parameter of constructor and second for `listen` method.

```js
var geokb = new Geokeyboard;
geokb.listen('#input1', {
    change: function(active) {
        if (active) {
            // ...
        } else {
            // ...
        }
    }
})
```

or 

```js
new Geokeyboard('#input1', {}, {
   change: function(active) {
       if (active) {
           // ...
       } else {
           // ...
       }
   } 
});
```

<a href="https://jsfiddle.net/dachinat/17ubm05v/" target="_blank">JSFiddle example</a>

### When any of selectors within an instance change

In this situation you're using the same function in constructor parameters, not selector options:

```js
new Geokeyboard('#input1', {
    change: function(active) {
       if (active) {
           // ...
       } else {
           // ...
       }
    }
}, {});
```

<a href="https://jsfiddle.net/dachinat/e3jagkf2/" target="_blank">See an example</a>