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
                    type: null, // on type callback
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

            const typeCallback = selector[this.constructor.opts].type;
            if (typeof typeCallback === 'function') {
                this.toggleListener(selector, 'type', 'keyup', e => {
                    typeCallback(e.currentTarget, this.constructor._getValue.call(this, e.currentTarget));
                });
            }
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

    static _getValue(selector) {
        selector = selector.frameElement || selector;
        if (selector.tagName === 'INPUT' || selector.tagName === 'TEXTAREA') {
            return selector.value;
        } else if (selector.tagName === 'DIV' || selector.tagName === 'IFRAME') {
            selector = this.constructor.getContext(selector);
            return selector.document ? selector.document.body.innerHTML : selector.innerHTML;
        }
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
        this.localSelectors = selectors;
        this._getSelectors();

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
        this._getSelectors();
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

    _getSelectors() {
        this.selectors = this.localSelectors ? Array.from(document.querySelectorAll(selectors)) : this.parent.selectors;
        return this.selectors;
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
        this.localSelectors = selectors;
        this._getSelectors();

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
        this._getSelectors();
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

    _getSelectors() {
        this.selectors = this.localSelectors ? Array.from(document.querySelectorAll(selectors)) : this.parent.selectors;
        return this.selectors;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZmU4ZGMzZTM3ZWYwNGJkMjM2NjYiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCOztBQUUxQixpQzs7Ozs7O0FDUkE7QUFDQSxvQ0FBb0MsU0FBUztBQUM3QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBOztBQUVBLHNDQUFzQyxTQUFTO0FBQy9DO0FBQ0E7O0FBRUEsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsa0NBQWtDO0FBQ2xDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLDRFQUE0RSxhQUFhLElBQUksY0FBYzs7QUFFM0c7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDREQUE0RCxlQUFlO0FBQzNFO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixzQkFBc0IsZ0NBQWdDLFNBQVM7QUFDNUY7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkI7Ozs7OztBQ25UQTtBQUNBLCtDQUErQztBQUMvQzs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCOzs7Ozs7QUN6RkE7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDBCOzs7Ozs7QUN4RkE7QUFDQSxpREFBaUQ7QUFDakQ7O0FBRUE7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw4Qjs7Ozs7O0FDOUJBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwrQiIsImZpbGUiOiJnZW9rZXlib2FyZC5kZXYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCBmZThkYzNlMzdlZjA0YmQyMzY2NiIsImNvbnN0IEdlb2tleWJvYXJkID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZCcpO1xuY29uc3QgU2VsZWN0ID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5zZWxlY3QuanMnKTtcbmNvbnN0IENoZWNrYm94ID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5jaGVja2JveC5qcycpO1xuY29uc3QgTG9jYWxTdG9yYWdlID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMnKTtcbmNvbnN0IGluc2VydEF0Q2FyZXQgPSByZXF1aXJlKCcuL2luc2VydC1hdC1jYXJldCcpO1xuXG5HZW9rZXlib2FyZC5leHRlbnNpb25zID0geyBTZWxlY3QsIENoZWNrYm94LCBMb2NhbFN0b3JhZ2UsIGluc2VydEF0Q2FyZXQgfTtcblxud2luZG93Lkdlb2tleWJvYXJkID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBHZW9rZXlib2FyZCB7XG4gICAgY29uc3RydWN0b3Ioc2VsZWN0b3JzLCBwYXJhbXM9e30sIG9wdHM9e30pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBbXTtcbiAgICAgICAgdGhpcy5leHRlbnNpb25zID0gbmV3IFNldDtcblxuICAgICAgICB0aGlzLmxhc3RGb2N1cyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGhvdFN3aXRjaEtleTogOTYsXG4gICAgICAgICAgICBjaGFuZ2U6IG51bGwsIC8vIChmbikgQ2hhbmdlcyBvdGhlciBzZWxlY3RvcnMgYW5kIGV4ZWN1dGVzIGEgY2FsbGJhY2tcbiAgICAgICAgICAgIGdsb2JhbHM6IFtdXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4oc2VsZWN0b3JzLCBvcHRzKTtcblxuICAgICAgICB0aGlzLl9sb2FkR2xvYmFsRXh0ZW5zaW9ucygpO1xuICAgIH1cblxuICAgIFtTeW1ib2wuY2FsbF0oc2VsZWN0b3JzLCBwYXJhbXM9e30sIG9wdHM9e30pIHtcbiAgICAgICAgcmV0dXJuIG5ldyB0aGlzLmNvbnN0cnVjdG9yKHNlbGVjdG9ycywgcGFyYW1zLCBvcHRzKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oc2VsZWN0b3JzLCBvcHRzPXt9LCBjYWxsYmFjaz1udWxsKSB7XG4gICAgICAgIGlmICghc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3dhcm5CYWRTZWxlY3RvcihzZWxlY3RvcnMpO1xuXG4gICAgICAgIHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpKTtcblxuICAgICAgICBzZWxlY3RvcnMuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VPblR5cGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VPblBhc3RlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaG90U3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2U6IG51bGwsIC8vIG9uIGNoYW5nZSBjYWxsYmFja1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBudWxsLCAvLyBvbiB0eXBlIGNhbGxiYWNrXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyczogW10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10sIG9wdHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25QYXN0ZScsICdwYXN0ZScsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VQYXN0ZWQuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnaG90U3dpdGNoJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5faG90U3dpdGNoLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ2NoZWNrRm9jdXMnLCAnZm9jdXMnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9jaGVja0ZvY3VzLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgY29uc3QgdHlwZUNhbGxiYWNrID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS50eXBlO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0eXBlQ2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAndHlwZScsICdrZXl1cCcsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlQ2FsbGJhY2soZS5jdXJyZW50VGFyZ2V0LCB0aGlzLmNvbnN0cnVjdG9yLl9nZXRWYWx1ZS5jYWxsKHRoaXMsIGUuY3VycmVudFRhcmdldCkpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzKSkpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBzZWxlY3RvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZEdsb2JhbEV4dGVuc2lvbnMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhdHRhY2goZXh0LCBzZWxlY3RvcnMsIG9wdHM9e30pIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBSZWZsZWN0LmNvbnN0cnVjdChleHQsIFt0aGlzLCBzZWxlY3RvcnMsIG9wdHNdKTtcbiAgICAgICAgdGhpcy5leHRlbnNpb25zLmFkZChpbnN0YW5jZSk7XG4gICAgICAgIHRoaXMuX2F0dGFjaExpc3RlbmVycyhpbnN0YW5jZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgX2F0dGFjaExpc3RlbmVycyhpbnN0YW5jZSkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBpbnN0YW5jZS5saXN0ZW5lcnMoKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgIGxldCBleHRPcHRzID0gZWxlbWVudFsxXS5yZWR1Y2UoKGFjYywgYykgPT4gT2JqZWN0LmFzc2lnbihhY2MsIHtbY1swXV06IHRydWV9KSwge2xpc3RlbmVyczogW119KTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IGV4dE9wdHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKGV4dE9wdHMsIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgaW5zdGFuY2Uub3B0cyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMV0uZm9yRWFjaChkZXRhaWxzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCBkZXRhaWxzWzBdLCBkZXRhaWxzWzFdLCBkZXRhaWxzWzJdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoW3NlbGVjdG9yXSkpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZT1mYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVtsaXN0ZW5lci5zcGxpdCgnLScpWzBdXSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuKSB7XG4gICAgICAgIGNvbnN0IGhhc0xpc3RlbmVyID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgICBpZiAoaGFzTGlzdGVuZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5wdXNoKHtbbGlzdGVuZXJdOiBmbn0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUpIHtcbiAgICAgICAgc2VsZWN0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5zcGxpY2UodGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpLCAxKTtcbiAgICB9XG5cbiAgICBoYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5maW5kSW5kZXgoZiA9PiB0eXBlb2YgZltsaXN0ZW5lcl0gPT09ICdmdW5jdGlvbicpO1xuICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID8gZmFsc2UgOiBpbmRleDtcbiAgICB9XG5cblxuICAgIGdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKTtcbiAgICAgICAgcmV0dXJuIGwgPyBsW2xpc3RlbmVyXSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBfZW5hYmxlKHNlbGVjdG9yLCBza2lwX2V4dD1mYWxzZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yLmhhc0F0dHJpYnV0ZSAmJiBzZWxlY3Rvci5oYXNBdHRyaWJ1dGUoJ3R5cGUnKSAmJiBzZWxlY3Rvci5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSAhPT0gJ3RleHQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnY2hhbmdlJ10gJiYgdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVR5cGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc2tpcF9leHQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGV4dCBvZiB0aGlzLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV4dC5lbmFibGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dC5lbmFibGVkLmNhbGwoZXh0LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Rpc2FibGUoc2VsZWN0b3IsIHNraXBfZXh0PWZhbHNlKSB7XG4gICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcbiAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnY2hhbmdlJ10gJiYgdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKCFza2lwX2V4dCkge1xuICAgICAgICAgICAgZm9yIChsZXQgZXh0IG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXh0LmRpc2FibGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dC5kaXNhYmxlZC5jYWxsKGV4dCwgc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfcmVwbGFjZVR5cGVkKGUpIHtcbiAgICAgICAgaWYgKCFuZXcgUmVnRXhwKHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmpvaW4oJ3wnKSkudGVzdChlLmtleSkgfHwgZS5rZXkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV4dGVuc2lvbnMuaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIFN0cmluZy5mcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5pbmRleE9mKGUua2V5KSArIDQzMDQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlUGFzdGVkKGUpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBlLmNsaXBib2FyZERhdGEgPyBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpIDogd2luZG93LmNsaXBib2FyZERhdGEgP1xuICAgICAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGEuZ2V0RGF0YSgnVGV4dCcpIDogbnVsbDtcblxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV4dGVuc2lvbnMuaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIGNvbnRlbnQuc3BsaXQoJycpXG4gICAgICAgICAgICAubWFwKGMgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmluZGV4T2YoYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICE9PSAtMSA/IFN0cmluZy5mcm9tQ2hhckNvZGUoaW5kZXggKyA0MzA0KSA6IGM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oJycpKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9jaGVja0ZvY3VzKGUpIHtcbiAgICAgICAgdGhpcy5sYXN0Rm9jdXMgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgfVxuXG4gICAgX2ZvY3VzKGFtb25nKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RGb2N1cyAmJiBhbW9uZy5pbmNsdWRlcyh0aGlzLmxhc3RGb2N1cy5mcmFtZUVsZW1lbnQgfHwgdGhpcy5sYXN0Rm9jdXMpKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1cy5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KGFtb25nWzBdKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF9ob3RTd2l0Y2goZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0aGlzLnBhcmFtcy5ob3RTd2l0Y2hLZXkgfHwgZS53aGljaCA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl90b2dnbGUuY2FsbCh0aGlzLCBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF90b2dnbGUoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhhc0xpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuX2Rpc2FibGUocywgcyA9PT0gc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtcy5jaGFuZ2UuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGUoc2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcmFtcy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZW5hYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2hhbmdlLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZShzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfbG9hZEdsb2JhbEV4dGVuc2lvbnMoKSB7XG4gICAgICAgIHRoaXMucGFyYW1zLmdsb2JhbHMuZm9yRWFjaChleHQgPT4ge1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gUmVmbGVjdC5jb25zdHJ1Y3QoZXh0WzBdLCBbdGhpcywgbnVsbCwgZXh0WzFdXSk7XG4gICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnMuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9nZXRWYWx1ZShzZWxlY3Rvcikge1xuICAgICAgICBzZWxlY3RvciA9IHNlbGVjdG9yLmZyYW1lRWxlbWVudCB8fCBzZWxlY3RvcjtcbiAgICAgICAgaWYgKHNlbGVjdG9yLnRhZ05hbWUgPT09ICdJTlBVVCcgfHwgc2VsZWN0b3IudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGVjdG9yLnZhbHVlO1xuICAgICAgICB9IGVsc2UgaWYgKHNlbGVjdG9yLnRhZ05hbWUgPT09ICdESVYnIHx8IHNlbGVjdG9yLnRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3IuZG9jdW1lbnQgPyBzZWxlY3Rvci5kb2N1bWVudC5ib2R5LmlubmVySFRNTCA6IHNlbGVjdG9yLmlubmVySFRNTDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfd2FybkJhZFNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBzZWxlY3RvcnMuc3BsaXQoJywgJykuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZVxuICAgICAgICAgICAgICAgICAgICAud2FybihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9OiBBbiBlbGVtZW50IHdpdGggaWRlbnRpZmllciAnJHtzZWxlY3Rvcn0nIG5vdCBmb3VuZC4gKFNraXBwaW5nLi4uKWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNoYXJhY3RlclNldCgpIHtcbiAgICAgICAgcmV0dXJuICdhYmdkZXZ6VGlrbG1ub3BKcnN0dWZxUnlTQ2Nad1d4amgnLnNwbGl0KCcnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Q29udGV4dChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gKHNlbGVjdG9yLnRhZ05hbWUgPT09ICdJRlJBTUUnKSA/XG4gICAgICAgICAgICAoc2VsZWN0b3IuY29udGVudFdpbmRvdyB8fCBzZWxlY3Rvci5jb250ZW50RG9jdW1lbnQpLndpbmRvdyA6IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgb3B0cygpIHtcbiAgICAgICAgcmV0dXJuICdnZW9rZXlib2FyZCc7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdlb2tleWJvYXJkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2dlb2tleWJvYXJkLmpzXG4vLyBtb2R1bGUgaWQgPSAyXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIFNlbGVjdCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBzZWxlY3RvcnM9bnVsbCwgb3B0cz17fSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICAvLyBBc3N1bWluZyBzdGF0ZSBpcyBnbG9iYWwgaWYgbm8gc2VsZWN0b3JzXG4gICAgICAgIHRoaXMubG9jYWxTZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG4gICAgICAgIHRoaXMuX2dldFNlbGVjdG9ycygpO1xuXG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgc2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgZm9jdXNMaXN0ZW5lckZvclNlbGVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdExpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZSxcbiAgICAgICAgfSwgb3B0cyk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5zZWxlY3QpIHx8IG51bGw7XG5cbiAgICAgICAgdGhpcy5zZWxlY3QudmFsdWUgPSB0aGlzLnNlbGVjdG9yc1swXVt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgaWYgKCFzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Ll9hdHRhY2hMaXN0ZW5lcnModGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzZWxlY3RDaGFuZ2VkKGUpIHtcbiAgICAgICAgdGhpcy5fZ2V0U2VsZWN0b3JzKCk7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VmFsdWUgPSBlLmN1cnJlbnRUYXJnZXQudmFsdWU7XG4gICAgICAgICAgICBpZiAoY3VycmVudFZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZW5hYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50VmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMucGFyZW50Ll9mb2N1cyh0aGlzLnNlbGVjdG9ycyk7XG4gICAgfVxuXG4gICAgdXBkYXRlU2VsZWN0KGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3QudmFsdWUgPSBlLmN1cnJlbnRUYXJnZXRbdGhpcy5wYXJlbnQuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZTtcbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2NoZW1hID0gW107XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaCgocyxpKSA9PiB7XG4gICAgICAgICAgICBzY2hlbWEucHVzaChbcywgW1xuICAgICAgICAgICAgICAgIFsnZm9jdXNMaXN0ZW5lckZvclNlbGVjdC0nK2ksICdmb2N1cycsIGUgPT4gdGhpcy51cGRhdGVTZWxlY3QuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NoZW1hLnB1c2goW3RoaXMuc2VsZWN0LCBbXG4gICAgICAgICAgICBbJ3NlbGVjdExpc3RlbmVyJywgJ2NoYW5nZScsIGUgPT4gdGhpcy5zZWxlY3RDaGFuZ2VkLmNhbGwodGhpcywgZSldXG4gICAgICAgIF1dKTtcblxuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cblxuICAgIGVuYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHRoaXMuc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yLmZyYW1lRWxlbWVudCB8fCBzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLnBhcmVudC5fZW5hYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMsIHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0LnZhbHVlID0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHRoaXMuc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yLmZyYW1lRWxlbWVudCB8fCBzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzLCB0cnVlKSk7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdC52YWx1ZSA9ICdmYWxzZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0U2VsZWN0b3JzKCkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IHRoaXMubG9jYWxTZWxlY3RvcnMgPyBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSkgOiB0aGlzLnBhcmVudC5zZWxlY3RvcnM7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdG9ycztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2dlb2tleWJvYXJkLnNlbGVjdC5qc1xuLy8gbW9kdWxlIGlkID0gM1xuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBDaGVja2JveCB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBzZWxlY3RvcnM9bnVsbCwgb3B0cz17fSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuICAgICAgICAvLyBBc3N1bWluZyBzdGF0ZSBpcyBnbG9iYWwgaWYgbm8gc2VsZWN0b3JzXG4gICAgICAgIHRoaXMubG9jYWxTZWxlY3RvcnMgPSBzZWxlY3RvcnM7XG4gICAgICAgIHRoaXMuX2dldFNlbGVjdG9ycygpO1xuXG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgY2hlY2tib3g6IG51bGwsXG4gICAgICAgICAgICBmb2N1c0xpc3RlbmVyRm9yQ2hlY2tib3g6IHRydWUsXG4gICAgICAgICAgICBjaGVja2JveExpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZSxcbiAgICAgICAgfSwgb3B0cyk7XG5cbiAgICAgICAgdGhpcy5jaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLmNoZWNrYm94KSB8fCBudWxsO1xuXG4gICAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IHRoaXMuc2VsZWN0b3JzWzBdW3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGU7XG5cbiAgICAgICAgaWYgKCFzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50Ll9hdHRhY2hMaXN0ZW5lcnModGhpcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja2JveENoYW5nZWQoZSkge1xuICAgICAgICB0aGlzLl9nZXRTZWxlY3RvcnMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXJlbnQuX2ZvY3VzKHRoaXMuc2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDaGVja2JveChlKSB7XG4gICAgICAgIC8vdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IHNbdGhpcy5wYXJlbnQuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSk7XG4gICAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IGUuY3VycmVudFRhcmdldFt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycygpIHtcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tib3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjaGVtYSA9IFtdO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2goKHMsaSkgPT4ge1xuICAgICAgICAgICAgc2NoZW1hLnB1c2goW3MsIFtcbiAgICAgICAgICAgICAgICBbJ2ZvY3VzTGlzdGVuZXJGb3JDaGVja2JveC0nK2ksICdmb2N1cycsIGUgPT4gdGhpcy51cGRhdGVDaGVja2JveC5jYWxsKHRoaXMsIGUpXVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzY2hlbWEucHVzaChbdGhpcy5jaGVja2JveCwgW1xuICAgICAgICAgICAgWydjaGVja2JveExpc3RlbmVyJywgJ2NoYW5nZScsIGUgPT4gdGhpcy5jaGVja2JveENoYW5nZWQuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgXV0pO1xuXG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxuXG4gICAgZW5hYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHRoaXMuc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yLmZyYW1lRWxlbWVudCB8fCBzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLnBhcmVudC5fZW5hYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMsIHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMsIHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2dldFNlbGVjdG9ycygpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSB0aGlzLmxvY2FsU2VsZWN0b3JzID8gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpIDogdGhpcy5wYXJlbnQuc2VsZWN0b3JzO1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RvcnM7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrYm94O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzXG4vLyBtb2R1bGUgaWQgPSA0XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIExvY2FsU3RvcmFnZSB7XG4gICAgY29uc3RydWN0b3IocGFyZW50LCBzZWxlY3RvcnM9bnVsbCwgcGFyYW1zPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBrZXk6ICdnZW9rZXlib2FyZF9nbG9iYWwnXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5sb2FkKCk7XG4gICAgfVxuXG4gICAgZW5hYmxlZCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5wYXJhbXMua2V5LCB0cnVlKTtcbiAgICB9XG5cbiAgICBkaXNhYmxlZCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5wYXJhbXMua2V5LCBmYWxzZSk7XG4gICAgfVxuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgY29uc3Qgc3RhdGUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMucGFyYW1zLmtleSkpO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wYXJlbnQuc2VsZWN0b3JzLmZvckVhY2gocyA9PiBzdGF0ZSA/IHRoaXMucGFyZW50Ll9lbmFibGUocykgOiB0aGlzLnBhcmVudC5fZGlzYWJsZShzKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IExvY2FsU3RvcmFnZTtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanNcbi8vIG1vZHVsZSBpZCA9IDVcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY29uc3QgaW5zZXJ0QXRDYXJldCA9IChlbGVtZW50LCBjb250ZW50KSA9PiB7XG4gICAgY29uc3QgdGFnTmFtZSA9IChlbGVtZW50LnRhZ05hbWUgfHwgZWxlbWVudC5mcmFtZUVsZW1lbnQudGFnTmFtZSk7XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ0RJVicgfHwgdGFnTmFtZSA9PT0gJ0lGUkFNRScpIHtcbiAgICAgICAgbGV0IHNlbCwgcmFuZ2U7XG5cbiAgICAgICAgbGV0IHdpbmRvd0NvbnRleHQgPSB3aW5kb3csIGRvY3VtZW50Q29udGV4dCA9IGRvY3VtZW50O1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ0lGUkFNRScpIHtcbiAgICAgICAgICAgIHdpbmRvd0NvbnRleHQgPSBlbGVtZW50LndpbmRvdztcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dCA9IGVsZW1lbnQuZG9jdW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93Q29udGV4dC5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbCA9IHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICAgICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRWxlbWVudCgnRElWJyk7XG4gICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgICAgICAgICAgICBsZXQgZnJhZyA9IGRvY3VtZW50Q29udGV4dC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIG5vZGUsIGxhc3ROb2RlO1xuICAgICAgICAgICAgICAgIHdoaWxlICgobm9kZSA9IGVsLmZpcnN0Q2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3ROb2RlID0gZnJhZy5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShmcmFnKTtcblxuICAgICAgICAgICAgICAgIGlmIChsYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihsYXN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbC5hZGRSYW5nZShyYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24gJiYgZG9jdW1lbnRDb250ZXh0LnNlbGVjdGlvbi50eXBlICE9PSAnQ29udHJvbCcpIHtcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5wYXN0ZUhUTUwoY29udGVudCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICdJTlBVVCcgfHwgdGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvbkVuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBlbGVtZW50LnZhbHVlLnNsaWNlKDAsIHN0YXJ0KSArIGNvbnRlbnQgKyBlbGVtZW50LnZhbHVlLnNsaWNlKGVsZW1lbnQuc2VsZWN0aW9uRW5kKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgMTtcbiAgICAgICAgICAgIGVsZW1lbnQuYmx1cigpO1xuICAgICAgICAgICAgZWxlbWVudC5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgIGxldCBub3JtYWwgPSBlbGVtZW50LnZhbHVlLnJlcGxhY2UoL1xcclxcbi9nLCAnXFxuJyk7XG5cbiAgICAgICAgICAgIGxldCB0ZXh0SW5wdXRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICB0ZXh0SW5wdXRSYW5nZS5tb3ZlVG9Cb29rbWFyayhyYW5nZS5nZXRCb29rbWFyaygpKTtcblxuICAgICAgICAgICAgbGV0IGVuZFJhbmdlID0gZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIGVuZFJhbmdlLmNvbGxhcHNlKGZhbHNlKTtcblxuICAgICAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG4gICAgICAgICAgICBpZiAodGV4dElucHV0UmFuZ2UuY29tcGFyZUVuZFBvaW50cygnU3RhcnRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSBlbmQgPSBjaGFyTGVuZ3RoO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IC10ZXh0SW5wdXRSYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICBzdGFydCArPSBub3JtYWwuc2xpY2UoMCwgc3RhcnQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ0VuZFRvRW5kJywgZW5kUmFuZ2UpID4gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSAtdGV4dElucHV0UmFuZ2UubW92ZUVuZCgnY2hhcmFjdGVyJywgLWNoYXJMZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICBlbmQgKz0gbm9ybWFsLnNsaWNlKDAsIGVuZCkuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5zbGljZSgwLCBzdGFydCkgKyBjb250ZW50ICsgZWxlbWVudC52YWx1ZS5zbGljZShlbmQpO1xuICAgICAgICAgICAgLy9zdGFydCsrO1xuXG4gICAgICAgICAgICB0ZXh0SW5wdXRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICB0ZXh0SW5wdXRSYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zZXJ0QXRDYXJldDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9pbnNlcnQtYXQtY2FyZXQuanNcbi8vIG1vZHVsZSBpZCA9IDZcbi8vIG1vZHVsZSBjaHVua3MgPSAwIl0sInNvdXJjZVJvb3QiOiIifQ==