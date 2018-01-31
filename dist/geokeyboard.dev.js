/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

const Geokeyboard = __webpack_require__(2);
const Select = __webpack_require__(3);
const Checkbox = __webpack_require__(4);
const LocalStorage = __webpack_require__(5);
const insertAtCaret = __webpack_require__(6);

Geokeyboard.extensions = { Select, Checkbox, LocalStorage, insertAtCaret };

window.Geokeyboard = Geokeyboard;

/***/ }),
/* 2 */
/***/ (function(module, exports) {

class Geokeyboard {
    constructor(selectors, params={}, opts={}) {
        this.selectors = [];
        this.extensions = new Set;

        this.lastFocus = null;

        this.params = Object.assign({
            hotSwitchKey: 96,
            change: null, // (fn) Changes other selectors and executes a callback
            globals: []
        }, params);

        this.listen(selectors, opts);

        this._loadGlobalExtensions();
    }

    [Symbol.call](selectors, params={}, opts={}) {
        return new this.constructor(selectors, params, opts);
    }

    listen(selectors, opts={}, callback=null) {
        if (!selectors) {
            return this;
        }

        this.constructor._warnBadSelector(selectors);

        selectors = Array.from(document.querySelectorAll(selectors));

        selectors.forEach(selector => {
            selector = this.constructor.getContext(selector);

            if (!selector[this.constructor.opts]) {
                selector[this.constructor.opts] = {
                    replaceOnType: true,
                    replaceOnPaste: false,
                    hotSwitch: true,
                    change: null, // on change callback
                    checkFocus: true,
                    listeners: [],
                };
            }
            selector[this.constructor.opts] = Object.assign(selector[this.constructor.opts], opts);

            this.toggleListener(selector, 'replaceOnType', 'keypress', e => {
                this.constructor._replaceTyped.call(this, e);
            });

            this.toggleListener(selector, 'replaceOnPaste', 'paste', e => {
                this.constructor._replacePasted.call(this, e);
            });

            this.toggleListener(selector, 'hotSwitch', 'keypress', e => {
                this.constructor._hotSwitch.call(this, e);
            });

            this.toggleListener(selector, 'checkFocus', 'focus', e => {
                this.constructor._checkFocus.call(this, e);
            }, true);
        });

        this.selectors = Array.from(new Set(this.selectors.concat(selectors)));

        if (callback) {
            callback.call(this, selectors);
        }

        this._loadGlobalExtensions();

        return this;
    }

    attach(ext, selectors, opts={}) {
        const instance = Reflect.construct(ext, [this, selectors, opts]);
        this.extensions.add(instance);
        this._attachListeners(instance);

        return this;
    }

    _attachListeners(instance) {
        const listeners = instance.listeners();
        if (!listeners) {
            return;
        }

        listeners.forEach(element => {
            let selector = element[0];
            let extOpts = element[1].reduce((acc, c) => Object.assign(acc, {[c[0]]: true}), {listeners: []});

            if (!selector[this.constructor.opts]) {
                selector[this.constructor.opts] = extOpts;
            } else {
                selector[this.constructor.opts] = Object.assign(extOpts, selector[this.constructor.opts]);
            }
            selector[this.constructor.opts] = Object.assign(selector[this.constructor.opts], instance.opts);

            element[1].forEach(details => {
                this.toggleListener(selector, details[0], details[1], details[2]);
            });

            this.selectors = Array.from(new Set(this.selectors.concat([selector])));
        });
    }

    toggleListener(selector, listener, type, fn, useCapture=false) {
        const index = this.hasListener(selector, listener);

        if (selector[this.constructor.opts][listener.split('-')[0]]) {
            if (index === false) {
                this.addListener(selector, listener, type, fn, useCapture)
            }
        } else {
            if (index !== false) {
                this.removeListener(selector, listener, type, useCapture);
            }
        }
    }

    addListener(selector, listener, type, fn) {
        const hasListener = this.hasListener(selector, listener);
        if (hasListener === false) {
            selector[this.constructor.opts].listeners.push({[listener]: fn});
        }
        selector.addEventListener(type, this.getListener(selector, listener));
    }

    removeListener(selector, listener, type) {
        selector.removeEventListener(type, this.getListener(selector, listener));
        selector[this.constructor.opts].listeners.splice(this.hasListener(selector, listener), 1);
    }

    hasListener(selector, listener) {
        const index = selector[this.constructor.opts].listeners.findIndex(f => typeof f[listener] === 'function');
        return index === -1 ? false : index;
    }


    getListener(selector, listener) {
        const l = selector[this.constructor.opts].listeners.find(f => f[listener]);
        return l ? l[listener] : undefined;
    }

    _enable(selector, skip_ext=false) {
        selector = this.constructor.getContext(selector);
        selector[this.constructor.opts].replaceOnType = true;

        if (selector.hasAttribute && selector.hasAttribute('type') && selector.getAttribute('type') !== 'text') {
            return;
        }

        if (selector[this.constructor.opts]['change'] && this.hasListener(selector, 'replaceOnType') === false) {
            selector[this.constructor.opts]['change'].call(this, true);
        }

        this.addListener(selector, 'replaceOnType', 'keypress', e => {
            this.constructor._replaceTyped.call(this, e);
        });

        if (!skip_ext) {
            for (let ext of this.extensions) {
                if (typeof ext.enabled === 'function') {
                    ext.enabled.call(ext, selector);
                }
            }
        }
    }

    _disable(selector, skip_ext=false) {
        selector = this.constructor.getContext(selector);
        selector[this.constructor.opts].replaceOnType = false;

        const listener = this.getListener(selector, 'replaceOnType');
        if (!listener) {
            return;
        }

        if (selector[this.constructor.opts]['change'] && this.hasListener(selector, 'replaceOnType') !== false) {
            selector[this.constructor.opts]['change'].call(this, false);
        }

        this.removeListener(selector, 'replaceOnType', 'keypress', listener);

        if (!skip_ext) {
            for (let ext of this.extensions) {
                if (typeof ext.disabled === 'function') {
                    ext.disabled.call(ext, selector);
                }
            }
        }
    }

    static _replaceTyped(e) {
        if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1) {
            return;
        }
        e.preventDefault();

        this.constructor.extensions.insertAtCaret(e.currentTarget, String.fromCharCode(
            this.constructor.characterSet.indexOf(e.key) + 4304)
        );
    }

    static _replacePasted(e) {
        let content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ?
            window.clipboardData.getData('Text') : null;

        this.constructor.extensions.insertAtCaret(e.currentTarget, content.split('')
            .map(c => {
                let index = this.constructor.characterSet.indexOf(c);
                return index !== -1 ? String.fromCharCode(index + 4304) : c;
            })
            .join(''));

        e.preventDefault();
    }

    static _checkFocus(e) {
        this.lastFocus = e.currentTarget;
    }

    _focus(among) {
        if (this.lastFocus && among.includes(this.lastFocus.frameElement || this.lastFocus)) {
            this.lastFocus.focus();
        } else {
            this.constructor.getContext(among[0]).focus();
        }
    }

    static _hotSwitch(e) {
        if (e.keyCode === this.params.hotSwitchKey || e.which === this.params.hotSwitchKey) {
            this.constructor._toggle.call(this, e.currentTarget);
            e.preventDefault();
        }
    }

    static _toggle(selector) {
        const index = this.hasListener(selector, 'replaceOnType');

        if (index !== false) {
            if (typeof this.params.change === 'function') {
                this.selectors.forEach(s => this._disable(s, s === selector));
                this.params.change.call(this, false);
            } else {
                this._disable(selector);
            }
        } else {
            if (typeof this.params.change === 'function') {
                this.selectors.forEach(s => this._enable(s, s === selector));
                this.params.change.call(this, true);
            } else {
                this._enable(selector);
            }
        }
    }

    _loadGlobalExtensions() {
        this.params.globals.forEach(ext => {
            let instance = Reflect.construct(ext[0], [this, null, ext[1]]);
            this.extensions.add(instance);
        });
    }

    static _warnBadSelector(selectors) {
        selectors.split(', ').forEach(selector => {
            if (!document.querySelector(selector)) {
                console
                    .warn(`${this.constructor.name}: An element with identifier '${selector}' not found. (Skipping...)`);
                return true;
            }
        });
    }

    static get characterSet() {
        return 'abgdevzTiklmnopJrstufqRySCcZwWxjh'.split('');
    }

    static getContext(selector) {
        return (selector.tagName === 'IFRAME') ?
            (selector.contentWindow || selector.contentDocument).window : selector;
    }

    static get opts() {
        return 'geokeyboard';
    }
}

module.exports = Geokeyboard;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

class Select {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        // Assuming state is global if no selectors
        if (selectors) {
            this.selectors = Array.from(document.querySelectorAll(selectors));
        } else {
            this.selectors = this.parent.selectors;
        }

        this.opts = Object.assign({
            select: null,
            focusListenerForSelect: true,
            selectListener: true,
            autoSwitch: true,
        }, opts);

        this.select = document.querySelector(this.opts.select) || null;

        this.select.value = this.selectors[0][this.parent.constructor.opts].replaceOnType.toString();

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    selectChanged(e) {
        this.selectors.forEach(s => {
            const currentValue = e.currentTarget.value;
            if (currentValue === 'true') {
                this.parent._enable.call(this.parent, s);
            } else if (currentValue === 'false') {
                this.parent._disable.call(this.parent, s);
            }
        });

        this.parent._focus(this.selectors);
    }

    updateSelect(e) {
        this.select.value = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    listeners() {
        if (this.select === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerForSelect-'+i, 'focus', e => this.updateSelect.call(this, e)]
            ]]);
        });

        schema.push([this.select, [
            ['selectListener', 'change', e => this.selectChanged.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
            this.select.value = 'true';
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
            this.select.value = 'false';
        }
    }
}

module.exports = Select;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

class Checkbox {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        // Assuming state is global if no selectors
        if (selectors) {
            this.selectors = Array.from(document.querySelectorAll(selectors));//selectors.split(', ');
        } else {
            this.selectors = this.parent.selectors;
        }

        this.opts = Object.assign({
            checkbox: null,
            focusListenerForCheckbox: true,
            checkboxListener: true,
            autoSwitch: true,
        }, opts);

        this.checkbox = document.querySelector(this.opts.checkbox) || null;

        this.checkbox.checked = this.selectors[0][this.parent.constructor.opts].replaceOnType;

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    checkboxChanged(e) {
        this.selectors.forEach(s => {
            if (e.currentTarget.checked === true) {
                this.parent._enable.call(this.parent, s);
            } else {
                this.parent._disable.call(this.parent, s);
            }
        });

        this.parent._focus(this.selectors);
    }

    updateCheckbox(e) {
        //this.selectors.forEach(s => this.checkbox.checked = s[this.parent.constructor.opts].replaceOnType);
        this.checkbox.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    listeners() {
        if (this.checkbox === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerForCheckbox-'+i, 'focus', e => this.updateCheckbox.call(this, e)]
            ]]);
        });

        schema.push([this.checkbox, [
            ['checkboxListener', 'change', e => this.checkboxChanged.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }
        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
            this.checkbox.checked = true;
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
            this.checkbox.checked = false;
        }
    }
}

module.exports = Checkbox;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

class LocalStorage {
    constructor(parent, selectors=null, params={}) {
        this.parent = parent;

        this.params = Object.assign({
            key: 'geokeyboard_global'
        }, params);

        this.load();
    }

    enabled() {
        localStorage.setItem(this.params.key, true);
    }

    disabled() {
        localStorage.setItem(this.params.key, false);
    }

    load() {
        const state = JSON.parse(localStorage.getItem(this.params.key));

        if (state === null) {
            return;
        }

        this.parent.selectors.forEach(s => state ? this.parent._enable(s) : this.parent._disable(s));
    }
}

module.exports = LocalStorage;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

const insertAtCaret = (element, content) => {
    const tagName = (element.tagName || element.frameElement.tagName);

    if (tagName === 'DIV' || tagName === 'IFRAME') {
        let sel, range;

        let windowContext = window, documentContext = document;
        if (tagName === 'IFRAME') {
            windowContext = element.window;
            documentContext = element.document;
        }

        if (windowContext.getSelection) {
            sel = windowContext.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                let el = documentContext.createElement('DIV');
                el.innerHTML = content;
                let frag = documentContext.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (documentContext.selection && documentContext.selection.type !== 'Control') {
            documentContext.selection.createRange().pasteHTML(content);
        }
    } else if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
        if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
            const start = element.selectionStart;
            element.value = element.value.slice(0, start) + content + element.value.slice(element.selectionEnd);
            element.selectionStart = element.selectionEnd = start + 1;
            element.blur();
            element.focus();
        } else {
            const range = document.selection.createRange();
            let normal = element.value.replace(/\r\n/g, '\n');

            let textInputRange = element.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            let endRange = element.createTextRange();
            endRange.collapse(false);

            let start, end;
            if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                start = end = charLength;
            } else {
                start = -textInputRange.moveStart('character', -charLength);
                start += normal.slice(0, start).split('\n').length - 1;

                if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                    end = charLength;
                } else {
                    end = -textInputRange.moveEnd('character', -charLength);
                    end += normal.slice(0, end).split('\n').length - 1;
                }
            }

            element.value = element.value.slice(0, start) + content + element.value.slice(end);
            //start++;

            textInputRange = element.createTextRange();
            textInputRange.collapse(true);
        }
    }
};

module.exports = insertAtCaret;

/***/ })
/******/ ]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMDRjYzQyZThjNzJkOGZlYTkzN2QiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCOztBQUUxQixpQzs7Ozs7O0FDUkE7QUFDQSxvQ0FBb0MsU0FBUztBQUM3QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBOztBQUVBLHNDQUFzQyxTQUFTO0FBQy9DO0FBQ0E7O0FBRUEsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0RUFBNEUsYUFBYSxJQUFJLGNBQWM7O0FBRTNHO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQsZUFBZTtBQUMzRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsc0JBQXNCLGdDQUFnQyxTQUFTO0FBQzVGO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCOzs7Ozs7QUNqU0E7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsd0I7Ozs7OztBQ3ZGQTtBQUNBLCtDQUErQztBQUMvQzs7QUFFQTtBQUNBO0FBQ0EsOEVBQThFO0FBQzlFLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEI7Ozs7OztBQ3RGQTtBQUNBLGlEQUFpRDtBQUNqRDs7QUFFQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBLDhCOzs7Ozs7QUM5QkE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBOztBQUVBO0FBQ0E7QUFDQSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLCtCIiwiZmlsZSI6Imdlb2tleWJvYXJkLmRldi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDA0Y2M0MmU4YzcyZDhmZWE5MzdkIiwiY29uc3QgR2Vva2V5Ym9hcmQgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkJyk7XG5jb25zdCBTZWxlY3QgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLnNlbGVjdC5qcycpO1xuY29uc3QgQ2hlY2tib3ggPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzJyk7XG5jb25zdCBMb2NhbFN0b3JhZ2UgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLmxvY2Fsc3RvcmFnZS5qcycpO1xuY29uc3QgaW5zZXJ0QXRDYXJldCA9IHJlcXVpcmUoJy4vaW5zZXJ0LWF0LWNhcmV0Jyk7XG5cbkdlb2tleWJvYXJkLmV4dGVuc2lvbnMgPSB7IFNlbGVjdCwgQ2hlY2tib3gsIExvY2FsU3RvcmFnZSwgaW5zZXJ0QXRDYXJldCB9O1xuXG53aW5kb3cuR2Vva2V5Ym9hcmQgPSBHZW9rZXlib2FyZDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9tYWluLmpzXG4vLyBtb2R1bGUgaWQgPSAxXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIEdlb2tleWJvYXJkIHtcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMsIHBhcmFtcz17fSwgb3B0cz17fSkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IFtdO1xuICAgICAgICB0aGlzLmV4dGVuc2lvbnMgPSBuZXcgU2V0O1xuXG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gbnVsbDtcblxuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaG90U3dpdGNoS2V5OiA5NixcbiAgICAgICAgICAgIGNoYW5nZTogbnVsbCwgLy8gKGZuKSBDaGFuZ2VzIG90aGVyIHNlbGVjdG9ycyBhbmQgZXhlY3V0ZXMgYSBjYWxsYmFja1xuICAgICAgICAgICAgZ2xvYmFsczogW11cbiAgICAgICAgfSwgcGFyYW1zKTtcblxuICAgICAgICB0aGlzLmxpc3RlbihzZWxlY3RvcnMsIG9wdHMpO1xuXG4gICAgICAgIHRoaXMuX2xvYWRHbG9iYWxFeHRlbnNpb25zKCk7XG4gICAgfVxuXG4gICAgW1N5bWJvbC5jYWxsXShzZWxlY3RvcnMsIHBhcmFtcz17fSwgb3B0cz17fSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3Ioc2VsZWN0b3JzLCBwYXJhbXMsIG9wdHMpO1xuICAgIH1cblxuICAgIGxpc3RlbihzZWxlY3RvcnMsIG9wdHM9e30sIGNhbGxiYWNrPW51bGwpIHtcbiAgICAgICAgaWYgKCFzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fd2FybkJhZFNlbGVjdG9yKHNlbGVjdG9ycyk7XG5cbiAgICAgICAgc2VsZWN0b3JzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpO1xuXG4gICAgICAgIHNlbGVjdG9ycy5mb3JFYWNoKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZU9uVHlwZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZU9uUGFzdGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBob3RTd2l0Y2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZTogbnVsbCwgLy8gb24gY2hhbmdlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyczogW10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10sIG9wdHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25QYXN0ZScsICdwYXN0ZScsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VQYXN0ZWQuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnaG90U3dpdGNoJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5faG90U3dpdGNoLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ2NoZWNrRm9jdXMnLCAnZm9jdXMnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9jaGVja0ZvY3VzLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KHNlbGVjdG9ycykpKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRHbG9iYWxFeHRlbnNpb25zKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXR0YWNoKGV4dCwgc2VsZWN0b3JzLCBvcHRzPXt9KSB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gUmVmbGVjdC5jb25zdHJ1Y3QoZXh0LCBbdGhpcywgc2VsZWN0b3JzLCBvcHRzXSk7XG4gICAgICAgIHRoaXMuZXh0ZW5zaW9ucy5hZGQoaW5zdGFuY2UpO1xuICAgICAgICB0aGlzLl9hdHRhY2hMaXN0ZW5lcnMoaW5zdGFuY2UpO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF9hdHRhY2hMaXN0ZW5lcnMoaW5zdGFuY2UpIHtcbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gaW5zdGFuY2UubGlzdGVuZXJzKCk7XG4gICAgICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGVsZW1lbnRbMF07XG4gICAgICAgICAgICBsZXQgZXh0T3B0cyA9IGVsZW1lbnRbMV0ucmVkdWNlKChhY2MsIGMpID0+IE9iamVjdC5hc3NpZ24oYWNjLCB7W2NbMF1dOiB0cnVlfSksIHtsaXN0ZW5lcnM6IFtdfSk7XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBleHRPcHRzO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdID0gT2JqZWN0LmFzc2lnbihleHRPcHRzLCBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10sIGluc3RhbmNlLm9wdHMpO1xuXG4gICAgICAgICAgICBlbGVtZW50WzFdLmZvckVhY2goZGV0YWlscyA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgZGV0YWlsc1swXSwgZGV0YWlsc1sxXSwgZGV0YWlsc1syXSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KFtzZWxlY3Rvcl0pKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgZm4sIHVzZUNhcHR1cmU9ZmFsc2UpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhhc0xpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bbGlzdGVuZXIuc3BsaXQoJy0nKVswXV0pIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgZm4sIHVzZUNhcHR1cmUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbikge1xuICAgICAgICBjb25zdCBoYXNMaXN0ZW5lciA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcbiAgICAgICAgaWYgKGhhc0xpc3RlbmVyID09PSBmYWxzZSkge1xuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMucHVzaCh7W2xpc3RlbmVyXTogZm59KTtcbiAgICAgICAgfVxuICAgICAgICBzZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMuZ2V0TGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlKSB7XG4gICAgICAgIHNlbGVjdG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuc3BsaWNlKHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSwgMSk7XG4gICAgfVxuXG4gICAgaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuZmluZEluZGV4KGYgPT4gdHlwZW9mIGZbbGlzdGVuZXJdID09PSAnZnVuY3Rpb24nKTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID09PSAtMSA/IGZhbHNlIDogaW5kZXg7XG4gICAgfVxuXG5cbiAgICBnZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgbCA9IHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ubGlzdGVuZXJzLmZpbmQoZiA9PiBmW2xpc3RlbmVyXSk7XG4gICAgICAgIHJldHVybiBsID8gbFtsaXN0ZW5lcl0gOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgX2VuYWJsZShzZWxlY3Rvciwgc2tpcF9leHQ9ZmFsc2UpIHtcbiAgICAgICAgc2VsZWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3IpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGUgPSB0cnVlO1xuXG4gICAgICAgIGlmIChzZWxlY3Rvci5oYXNBdHRyaWJ1dGUgJiYgc2VsZWN0b3IuaGFzQXR0cmlidXRlKCd0eXBlJykgJiYgc2VsZWN0b3IuZ2V0QXR0cmlidXRlKCd0eXBlJykgIT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddICYmIHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydjaGFuZ2UnXS5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoIXNraXBfZXh0KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBleHQgb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBleHQuZW5hYmxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBleHQuZW5hYmxlZC5jYWxsKGV4dCwgc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9kaXNhYmxlKHNlbGVjdG9yLCBza2lwX2V4dD1mYWxzZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddICYmIHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJykgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydjaGFuZ2UnXS5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJywgJ2tleXByZXNzJywgbGlzdGVuZXIpO1xuXG4gICAgICAgIGlmICghc2tpcF9leHQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGV4dCBvZiB0aGlzLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV4dC5kaXNhYmxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICBleHQuZGlzYWJsZWQuY2FsbChleHQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX3JlcGxhY2VUeXBlZChlKSB7XG4gICAgICAgIGlmICghbmV3IFJlZ0V4cCh0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5qb2luKCd8JykpLnRlc3QoZS5rZXkpIHx8IGUua2V5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5leHRlbnNpb25zLmluc2VydEF0Q2FyZXQoZS5jdXJyZW50VGFyZ2V0LCBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihlLmtleSkgKyA0MzA0KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBfcmVwbGFjZVBhc3RlZChlKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gZS5jbGlwYm9hcmREYXRhID8gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKSA6IHdpbmRvdy5jbGlwYm9hcmREYXRhID9cbiAgICAgICAgICAgIHdpbmRvdy5jbGlwYm9hcmREYXRhLmdldERhdGEoJ1RleHQnKSA6IG51bGw7XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5leHRlbnNpb25zLmluc2VydEF0Q2FyZXQoZS5jdXJyZW50VGFyZ2V0LCBjb250ZW50LnNwbGl0KCcnKVxuICAgICAgICAgICAgLm1hcChjID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5pbmRleE9mKGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCAhPT0gLTEgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKGluZGV4ICsgNDMwNCkgOiBjO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5qb2luKCcnKSk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfY2hlY2tGb2N1cyhlKSB7XG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgIH1cblxuICAgIF9mb2N1cyhhbW9uZykge1xuICAgICAgICBpZiAodGhpcy5sYXN0Rm9jdXMgJiYgYW1vbmcuaW5jbHVkZXModGhpcy5sYXN0Rm9jdXMuZnJhbWVFbGVtZW50IHx8IHRoaXMubGFzdEZvY3VzKSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChhbW9uZ1swXSkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfaG90U3dpdGNoKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5IHx8IGUud2hpY2ggPT09IHRoaXMucGFyYW1zLmhvdFN3aXRjaEtleSkge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fdG9nZ2xlLmNhbGwodGhpcywgZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfdG9nZ2xlKHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKTtcblxuICAgICAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyYW1zLmNoYW5nZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLl9kaXNhYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2hhbmdlLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuX2VuYWJsZShzLCBzID09PSBzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1zLmNoYW5nZS5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGUoc2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2xvYWRHbG9iYWxFeHRlbnNpb25zKCkge1xuICAgICAgICB0aGlzLnBhcmFtcy5nbG9iYWxzLmZvckVhY2goZXh0ID0+IHtcbiAgICAgICAgICAgIGxldCBpbnN0YW5jZSA9IFJlZmxlY3QuY29uc3RydWN0KGV4dFswXSwgW3RoaXMsIG51bGwsIGV4dFsxXV0pO1xuICAgICAgICAgICAgdGhpcy5leHRlbnNpb25zLmFkZChpbnN0YW5jZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBfd2FybkJhZFNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBzZWxlY3RvcnMuc3BsaXQoJywgJykuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZVxuICAgICAgICAgICAgICAgICAgICAud2FybihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9OiBBbiBlbGVtZW50IHdpdGggaWRlbnRpZmllciAnJHtzZWxlY3Rvcn0nIG5vdCBmb3VuZC4gKFNraXBwaW5nLi4uKWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNoYXJhY3RlclNldCgpIHtcbiAgICAgICAgcmV0dXJuICdhYmdkZXZ6VGlrbG1ub3BKcnN0dWZxUnlTQ2Nad1d4amgnLnNwbGl0KCcnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Q29udGV4dChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gKHNlbGVjdG9yLnRhZ05hbWUgPT09ICdJRlJBTUUnKSA/XG4gICAgICAgICAgICAoc2VsZWN0b3IuY29udGVudFdpbmRvdyB8fCBzZWxlY3Rvci5jb250ZW50RG9jdW1lbnQpLndpbmRvdyA6IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb3B0cygpIHtcbiAgICAgICAgcmV0dXJuICdnZW9rZXlib2FyZCc7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlb2tleWJvYXJkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2dlb2tleWJvYXJkLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIFNlbGVjdCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBzZWxlY3RvcnM9bnVsbCwgb3B0cz17fSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICAvLyBBc3N1bWluZyBzdGF0ZSBpcyBnbG9iYWwgaWYgbm8gc2VsZWN0b3JzXG4gICAgICAgIGlmIChzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSB0aGlzLnBhcmVudC5zZWxlY3RvcnM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgIGZvY3VzTGlzdGVuZXJGb3JTZWxlY3Q6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RMaXN0ZW5lcjogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9Td2l0Y2g6IHRydWUsXG4gICAgICAgIH0sIG9wdHMpO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdHMuc2VsZWN0KSB8fCBudWxsO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0LnZhbHVlID0gdGhpcy5zZWxlY3RvcnNbMF1bdGhpcy5wYXJlbnQuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZS50b1N0cmluZygpO1xuXG4gICAgICAgIGlmICghc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5fYXR0YWNoTGlzdGVuZXJzKHRoaXMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2VsZWN0Q2hhbmdlZChlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBlLmN1cnJlbnRUYXJnZXQudmFsdWU7XG4gICAgICAgICAgICBpZiAoY3VycmVudFZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZW5hYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQuX2ZvY3VzKHRoaXMuc2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTZWxlY3QoZSkge1xuICAgICAgICB0aGlzLnNlbGVjdC52YWx1ZSA9IGUuY3VycmVudFRhcmdldFt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycygpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlbWEgPSBbXTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKChzLGkpID0+IHtcbiAgICAgICAgICAgIHNjaGVtYS5wdXNoKFtzLCBbXG4gICAgICAgICAgICAgICAgWydmb2N1c0xpc3RlbmVyRm9yU2VsZWN0LScraSwgJ2ZvY3VzJywgZSA9PiB0aGlzLnVwZGF0ZVNlbGVjdC5jYWxsKHRoaXMsIGUpXVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzY2hlbWEucHVzaChbdGhpcy5zZWxlY3QsIFtcbiAgICAgICAgICAgIFsnc2VsZWN0TGlzdGVuZXInLCAnY2hhbmdlJywgZSA9PiB0aGlzLnNlbGVjdENoYW5nZWQuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgXV0pO1xuXG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxuXG4gICAgZW5hYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgcywgdHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QudmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMsIHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0LnZhbHVlID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQuc2VsZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIENoZWNrYm94IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIC8vIEFzc3VtaW5nIHN0YXRlIGlzIGdsb2JhbCBpZiBubyBzZWxlY3RvcnNcbiAgICAgICAgaWYgKHNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSk7Ly9zZWxlY3RvcnMuc3BsaXQoJywgJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IHRoaXMucGFyZW50LnNlbGVjdG9ycztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgY2hlY2tib3g6IG51bGwsXG4gICAgICAgICAgICBmb2N1c0xpc3RlbmVyRm9yQ2hlY2tib3g6IHRydWUsXG4gICAgICAgICAgICBjaGVja2JveExpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZSxcbiAgICAgICAgfSwgb3B0cyk7XG5cbiAgICAgICAgdGhpcy5jaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLmNoZWNrYm94KSB8fCBudWxsO1xuXG4gICAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IHRoaXMuc2VsZWN0b3JzWzBdW3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGU7XG5cbiAgICAgICAgaWYgKCFzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Ll9hdHRhY2hMaXN0ZW5lcnModGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja2JveENoYW5nZWQoZSkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldC5jaGVja2VkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2VuYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2Rpc2FibGUuY2FsbCh0aGlzLnBhcmVudCwgcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGFyZW50Ll9mb2N1cyh0aGlzLnNlbGVjdG9ycyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2hlY2tib3goZSkge1xuICAgICAgICAvL3RoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLmNoZWNrYm94LmNoZWNrZWQgPSBzW3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGUpO1xuICAgICAgICB0aGlzLmNoZWNrYm94LmNoZWNrZWQgPSBlLmN1cnJlbnRUYXJnZXRbdGhpcy5wYXJlbnQuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLmNoZWNrYm94ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlbWEgPSBbXTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKChzLGkpID0+IHtcbiAgICAgICAgICAgIHNjaGVtYS5wdXNoKFtzLCBbXG4gICAgICAgICAgICAgICAgWydmb2N1c0xpc3RlbmVyRm9yQ2hlY2tib3gtJytpLCAnZm9jdXMnLCBlID0+IHRoaXMudXBkYXRlQ2hlY2tib3guY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NoZW1hLnB1c2goW3RoaXMuY2hlY2tib3gsIFtcbiAgICAgICAgICAgIFsnY2hlY2tib3hMaXN0ZW5lcicsICdjaGFuZ2UnLCBlID0+IHRoaXMuY2hlY2tib3hDaGFuZ2VkLmNhbGwodGhpcywgZSldXG4gICAgICAgIF1dKTtcblxuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cblxuICAgIGVuYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0b1N3aXRjaCAmJiB0aGlzLnNlbGVjdG9ycy5pbmNsdWRlcyhzZWxlY3Rvci5mcmFtZUVsZW1lbnQgfHwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5wYXJlbnQuX2VuYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzLCB0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrYm94LmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHRoaXMuc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yLmZyYW1lRWxlbWVudCB8fCBzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzLCB0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLmNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDaGVja2JveDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9nZW9rZXlib2FyZC5jaGVja2JveC5qc1xuLy8gbW9kdWxlIGlkID0gNFxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBMb2NhbFN0b3JhZ2Uge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgc2VsZWN0b3JzPW51bGwsIHBhcmFtcz17fSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAga2V5OiAnZ2Vva2V5Ym9hcmRfZ2xvYmFsJ1xuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubG9hZCgpO1xuICAgIH1cblxuICAgIGVuYWJsZWQoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMucGFyYW1zLmtleSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgZGlzYWJsZWQoKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMucGFyYW1zLmtleSwgZmFsc2UpO1xuICAgIH1cblxuICAgIGxvYWQoKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLnBhcmFtcy5rZXkpKTtcblxuICAgICAgICBpZiAoc3RhdGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucGFyZW50LnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gc3RhdGUgPyB0aGlzLnBhcmVudC5fZW5hYmxlKHMpIDogdGhpcy5wYXJlbnQuX2Rpc2FibGUocykpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbFN0b3JhZ2U7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQubG9jYWxzdG9yYWdlLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IGluc2VydEF0Q2FyZXQgPSAoZWxlbWVudCwgY29udGVudCkgPT4ge1xuICAgIGNvbnN0IHRhZ05hbWUgPSAoZWxlbWVudC50YWdOYW1lIHx8IGVsZW1lbnQuZnJhbWVFbGVtZW50LnRhZ05hbWUpO1xuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdESVYnIHx8IHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgIGxldCBzZWwsIHJhbmdlO1xuXG4gICAgICAgIGxldCB3aW5kb3dDb250ZXh0ID0gd2luZG93LCBkb2N1bWVudENvbnRleHQgPSBkb2N1bWVudDtcbiAgICAgICAgaWYgKHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgICAgICB3aW5kb3dDb250ZXh0ID0gZWxlbWVudC53aW5kb3c7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQgPSBlbGVtZW50LmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW5kb3dDb250ZXh0LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnRDb250ZXh0LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgbGV0IGZyYWcgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLCBub2RlLCBsYXN0Tm9kZTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoKG5vZGUgPSBlbC5maXJzdENoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0Tm9kZSA9IGZyYWcuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUoZnJhZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0QWZ0ZXIobGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uICYmIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24udHlwZSAhPT0gJ0NvbnRyb2wnKSB7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkucGFzdGVIVE1MKGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgZWxlbWVudC5zZWxlY3Rpb25FbmQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5zbGljZSgwLCBzdGFydCkgKyBjb250ZW50ICsgZWxlbWVudC52YWx1ZS5zbGljZShlbGVtZW50LnNlbGVjdGlvbkVuZCk7XG4gICAgICAgICAgICBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIDE7XG4gICAgICAgICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICBsZXQgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgIGxldCBlbmRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSAtdGV4dElucHV0UmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc3RhcnQgKz0gbm9ybWFsLnNsaWNlKDAsIHN0YXJ0KS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdFbmRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gLXRleHRJbnB1dFJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kICs9IG5vcm1hbC5zbGljZSgwLCBlbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgICAgIC8vc3RhcnQrKztcblxuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEF0Q2FyZXQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5zZXJ0LWF0LWNhcmV0LmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=