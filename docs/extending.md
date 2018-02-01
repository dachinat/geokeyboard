---
layout: default
---

# Extending a library

This library is written in `ES2005+` and uses `webpack`, `babel` polyfills for distributed usage.

### Preparing necessary files

To extend this library, navigate to `/src` directory and create `geokeyboard.your_ext_name.js`

Open `main.js` and add

```js
const YourExtName = require('./geokeyboard.your_ext_name.js');
```

below first statement.

Look at line that is second to last and change it, so that it looks like

```js
Geokeyboard.extensions = { Select, Checkbox, LocalStorage, YourExtName, insertAtCaret };
```

Save and open `geokeyboard.your_ext_name`

### Writing your extension

An extension class should resemble following pattern.

```js
class YourExtName {
    // You can assume that scope is global if selectors is null
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;
    }
    
    listeners() {
        return [
          [DOMElement, ['callbackName', 'EventType', (e) => {}]]  
        ];
    }
    
    // Called when any of selectors get enabled
    enabled(selector) {
    }
    
    // Called when any of selectors get disabled
    disabled(selector) {
    }
}

module.exports = YourExtName;
```

After this, you should be able to use extension in class constructor parameter's global option and in an `attach`
method.
