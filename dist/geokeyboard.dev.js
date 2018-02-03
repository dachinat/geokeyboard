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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgMWRhZmYxNzFiZWY3YmFmNDQxYzAiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCOztBQUUxQixpQzs7Ozs7O0FDUkE7QUFDQSxvQ0FBb0MsU0FBUztBQUM3QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTtBQUNBOztBQUVBLHNDQUFzQyxTQUFTO0FBQy9DO0FBQ0E7O0FBRUEsNkJBQTZCO0FBQzdCO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7O0FBRWI7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTOztBQUVUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBLGtDQUFrQztBQUNsQztBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSw0RUFBNEUsYUFBYSxJQUFJLGNBQWM7O0FBRTNHO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQsZUFBZTtBQUMzRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2QkFBNkIsc0JBQXNCLGdDQUFnQyxTQUFTO0FBQzVGO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDZCOzs7Ozs7QUNqU0E7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTOztBQUVUOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSx3Qjs7Ozs7O0FDekZBO0FBQ0EsK0NBQStDO0FBQy9DOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQjs7Ozs7O0FDeEZBO0FBQ0EsaURBQWlEO0FBQ2pEOztBQUVBO0FBQ0E7QUFDQSxTQUFTOztBQUVUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsOEI7Ozs7OztBQzlCQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsK0IiLCJmaWxlIjoiZ2Vva2V5Ym9hcmQuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7XG4gXHRcdFx0XHRjb25maWd1cmFibGU6IGZhbHNlLFxuIFx0XHRcdFx0ZW51bWVyYWJsZTogdHJ1ZSxcbiBcdFx0XHRcdGdldDogZ2V0dGVyXG4gXHRcdFx0fSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gMCk7XG5cblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gd2VicGFjay9ib290c3RyYXAgMWRhZmYxNzFiZWY3YmFmNDQxYzAiLCJjb25zdCBHZW9rZXlib2FyZCA9IHJlcXVpcmUoJy4vZ2Vva2V5Ym9hcmQnKTtcbmNvbnN0IFNlbGVjdCA9IHJlcXVpcmUoJy4vZ2Vva2V5Ym9hcmQuc2VsZWN0LmpzJyk7XG5jb25zdCBDaGVja2JveCA9IHJlcXVpcmUoJy4vZ2Vva2V5Ym9hcmQuY2hlY2tib3guanMnKTtcbmNvbnN0IExvY2FsU3RvcmFnZSA9IHJlcXVpcmUoJy4vZ2Vva2V5Ym9hcmQubG9jYWxzdG9yYWdlLmpzJyk7XG5jb25zdCBpbnNlcnRBdENhcmV0ID0gcmVxdWlyZSgnLi9pbnNlcnQtYXQtY2FyZXQnKTtcblxuR2Vva2V5Ym9hcmQuZXh0ZW5zaW9ucyA9IHsgU2VsZWN0LCBDaGVja2JveCwgTG9jYWxTdG9yYWdlLCBpbnNlcnRBdENhcmV0IH07XG5cbndpbmRvdy5HZW9rZXlib2FyZCA9IEdlb2tleWJvYXJkO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL21haW4uanNcbi8vIG1vZHVsZSBpZCA9IDFcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgR2Vva2V5Ym9hcmQge1xuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9ycywgcGFyYW1zPXt9LCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzID0gW107XG4gICAgICAgIHRoaXMuZXh0ZW5zaW9ucyA9IG5ldyBTZXQ7XG5cbiAgICAgICAgdGhpcy5sYXN0Rm9jdXMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBob3RTd2l0Y2hLZXk6IDk2LFxuICAgICAgICAgICAgY2hhbmdlOiBudWxsLCAvLyAoZm4pIENoYW5nZXMgb3RoZXIgc2VsZWN0b3JzIGFuZCBleGVjdXRlcyBhIGNhbGxiYWNrXG4gICAgICAgICAgICBnbG9iYWxzOiBbXVxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHNlbGVjdG9ycywgb3B0cyk7XG5cbiAgICAgICAgdGhpcy5fbG9hZEdsb2JhbEV4dGVuc2lvbnMoKTtcbiAgICB9XG5cbiAgICBbU3ltYm9sLmNhbGxdKHNlbGVjdG9ycywgcGFyYW1zPXt9LCBvcHRzPXt9KSB7XG4gICAgICAgIHJldHVybiBuZXcgdGhpcy5jb25zdHJ1Y3RvcihzZWxlY3RvcnMsIHBhcmFtcywgb3B0cyk7XG4gICAgfVxuXG4gICAgbGlzdGVuKHNlbGVjdG9ycywgb3B0cz17fSwgY2FsbGJhY2s9bnVsbCkge1xuICAgICAgICBpZiAoIXNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl93YXJuQmFkU2VsZWN0b3Ioc2VsZWN0b3JzKTtcblxuICAgICAgICBzZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSk7XG5cbiAgICAgICAgc2VsZWN0b3JzLmZvckVhY2goc2VsZWN0b3IgPT4ge1xuICAgICAgICAgICAgc2VsZWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10pIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdID0ge1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlT25UeXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICByZXBsYWNlT25QYXN0ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGhvdFN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlOiBudWxsLCAvLyBvbiBjaGFuZ2UgY2FsbGJhY2tcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzOiBbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgb3B0cyk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVR5cGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblBhc3RlJywgJ3Bhc3RlJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVBhc3RlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdob3RTd2l0Y2gnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9ob3RTd2l0Y2guY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnY2hlY2tGb2N1cycsICdmb2N1cycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX2NoZWNrRm9jdXMuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzKSkpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBzZWxlY3RvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZEdsb2JhbEV4dGVuc2lvbnMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhdHRhY2goZXh0LCBzZWxlY3RvcnMsIG9wdHM9e30pIHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2UgPSBSZWZsZWN0LmNvbnN0cnVjdChleHQsIFt0aGlzLCBzZWxlY3RvcnMsIG9wdHNdKTtcbiAgICAgICAgdGhpcy5leHRlbnNpb25zLmFkZChpbnN0YW5jZSk7XG4gICAgICAgIHRoaXMuX2F0dGFjaExpc3RlbmVycyhpbnN0YW5jZSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgX2F0dGFjaExpc3RlbmVycyhpbnN0YW5jZSkge1xuICAgICAgICBjb25zdCBsaXN0ZW5lcnMgPSBpbnN0YW5jZS5saXN0ZW5lcnMoKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3RlbmVycy5mb3JFYWNoKGVsZW1lbnQgPT4ge1xuICAgICAgICAgICAgbGV0IHNlbGVjdG9yID0gZWxlbWVudFswXTtcbiAgICAgICAgICAgIGxldCBleHRPcHRzID0gZWxlbWVudFsxXS5yZWR1Y2UoKGFjYywgYykgPT4gT2JqZWN0LmFzc2lnbihhY2MsIHtbY1swXV06IHRydWV9KSwge2xpc3RlbmVyczogW119KTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IGV4dE9wdHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKGV4dE9wdHMsIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgaW5zdGFuY2Uub3B0cyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMV0uZm9yRWFjaChkZXRhaWxzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCBkZXRhaWxzWzBdLCBkZXRhaWxzWzFdLCBkZXRhaWxzWzJdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoW3NlbGVjdG9yXSkpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZT1mYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVtsaXN0ZW5lci5zcGxpdCgnLScpWzBdXSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuKSB7XG4gICAgICAgIGNvbnN0IGhhc0xpc3RlbmVyID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgICBpZiAoaGFzTGlzdGVuZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5wdXNoKHtbbGlzdGVuZXJdOiBmbn0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUpIHtcbiAgICAgICAgc2VsZWN0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5zcGxpY2UodGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpLCAxKTtcbiAgICB9XG5cbiAgICBoYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5maW5kSW5kZXgoZiA9PiB0eXBlb2YgZltsaXN0ZW5lcl0gPT09ICdmdW5jdGlvbicpO1xuICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID8gZmFsc2UgOiBpbmRleDtcbiAgICB9XG5cblxuICAgIGdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKTtcbiAgICAgICAgcmV0dXJuIGwgPyBsW2xpc3RlbmVyXSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBfZW5hYmxlKHNlbGVjdG9yLCBza2lwX2V4dD1mYWxzZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSA9IHRydWU7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yLmhhc0F0dHJpYnV0ZSAmJiBzZWxlY3Rvci5oYXNBdHRyaWJ1dGUoJ3R5cGUnKSAmJiBzZWxlY3Rvci5nZXRBdHRyaWJ1dGUoJ3R5cGUnKSAhPT0gJ3RleHQnKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnY2hhbmdlJ10gJiYgdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVR5cGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghc2tpcF9leHQpIHtcbiAgICAgICAgICAgIGZvciAobGV0IGV4dCBvZiB0aGlzLmV4dGVuc2lvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGV4dC5lbmFibGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dC5lbmFibGVkLmNhbGwoZXh0LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Rpc2FibGUoc2VsZWN0b3IsIHNraXBfZXh0PWZhbHNlKSB7XG4gICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcbiAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlID0gZmFsc2U7XG5cbiAgICAgICAgY29uc3QgbGlzdGVuZXIgPSB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuICAgICAgICBpZiAoIWxpc3RlbmVyKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnY2hhbmdlJ10gJiYgdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ2NoYW5nZSddLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKCFza2lwX2V4dCkge1xuICAgICAgICAgICAgZm9yIChsZXQgZXh0IG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXh0LmRpc2FibGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4dC5kaXNhYmxlZC5jYWxsKGV4dCwgc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfcmVwbGFjZVR5cGVkKGUpIHtcbiAgICAgICAgaWYgKCFuZXcgUmVnRXhwKHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmpvaW4oJ3wnKSkudGVzdChlLmtleSkgfHwgZS5rZXkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV4dGVuc2lvbnMuaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIFN0cmluZy5mcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5pbmRleE9mKGUua2V5KSArIDQzMDQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlUGFzdGVkKGUpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBlLmNsaXBib2FyZERhdGEgPyBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpIDogd2luZG93LmNsaXBib2FyZERhdGEgP1xuICAgICAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGEuZ2V0RGF0YSgnVGV4dCcpIDogbnVsbDtcblxuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmV4dGVuc2lvbnMuaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIGNvbnRlbnQuc3BsaXQoJycpXG4gICAgICAgICAgICAubWFwKGMgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBpbmRleCA9IHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmluZGV4T2YoYyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluZGV4ICE9PSAtMSA/IFN0cmluZy5mcm9tQ2hhckNvZGUoaW5kZXggKyA0MzA0KSA6IGM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmpvaW4oJycpKTtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9jaGVja0ZvY3VzKGUpIHtcbiAgICAgICAgdGhpcy5sYXN0Rm9jdXMgPSBlLmN1cnJlbnRUYXJnZXQ7XG4gICAgfVxuXG4gICAgX2ZvY3VzKGFtb25nKSB7XG4gICAgICAgIGlmICh0aGlzLmxhc3RGb2N1cyAmJiBhbW9uZy5pbmNsdWRlcyh0aGlzLmxhc3RGb2N1cy5mcmFtZUVsZW1lbnQgfHwgdGhpcy5sYXN0Rm9jdXMpKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1cy5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KGFtb25nWzBdKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF9ob3RTd2l0Y2goZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0aGlzLnBhcmFtcy5ob3RTd2l0Y2hLZXkgfHwgZS53aGljaCA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl90b2dnbGUuY2FsbCh0aGlzLCBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF90b2dnbGUoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhhc0xpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuY2hhbmdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuX2Rpc2FibGUocywgcyA9PT0gc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtcy5jaGFuZ2UuY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc2FibGUoc2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcmFtcy5jaGFuZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZW5hYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuY2hhbmdlLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZShzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfbG9hZEdsb2JhbEV4dGVuc2lvbnMoKSB7XG4gICAgICAgIHRoaXMucGFyYW1zLmdsb2JhbHMuZm9yRWFjaChleHQgPT4ge1xuICAgICAgICAgICAgbGV0IGluc3RhbmNlID0gUmVmbGVjdC5jb25zdHJ1Y3QoZXh0WzBdLCBbdGhpcywgbnVsbCwgZXh0WzFdXSk7XG4gICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnMuYWRkKGluc3RhbmNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF93YXJuQmFkU2VsZWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgICAgIHNlbGVjdG9ycy5zcGxpdCgnLCAnKS5mb3JFYWNoKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlXG4gICAgICAgICAgICAgICAgICAgIC53YXJuKGAke3RoaXMuY29uc3RydWN0b3IubmFtZX06IEFuIGVsZW1lbnQgd2l0aCBpZGVudGlmaWVyICcke3NlbGVjdG9yfScgbm90IGZvdW5kLiAoU2tpcHBpbmcuLi4pYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2hhcmFjdGVyU2V0KCkge1xuICAgICAgICByZXR1cm4gJ2FiZ2RldnpUaWtsbW5vcEpyc3R1ZnFSeVNDY1p3V3hqaCcuc3BsaXQoJycpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRDb250ZXh0KHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiAoc2VsZWN0b3IudGFnTmFtZSA9PT0gJ0lGUkFNRScpID9cbiAgICAgICAgICAgIChzZWxlY3Rvci5jb250ZW50V2luZG93IHx8IHNlbGVjdG9yLmNvbnRlbnREb2N1bWVudCkud2luZG93IDogc2VsZWN0b3I7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvcHRzKCkge1xuICAgICAgICByZXR1cm4gJ2dlb2tleWJvYXJkJztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQuanNcbi8vIG1vZHVsZSBpZCA9IDJcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgU2VsZWN0IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIC8vIEFzc3VtaW5nIHN0YXRlIGlzIGdsb2JhbCBpZiBubyBzZWxlY3RvcnNcbiAgICAgICAgdGhpcy5sb2NhbFNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICAgICAgdGhpcy5fZ2V0U2VsZWN0b3JzKCk7XG5cbiAgICAgICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBzZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICBmb2N1c0xpc3RlbmVyRm9yU2VsZWN0OiB0cnVlLFxuICAgICAgICAgICAgc2VsZWN0TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICBhdXRvU3dpdGNoOiB0cnVlLFxuICAgICAgICB9LCBvcHRzKTtcblxuICAgICAgICB0aGlzLnNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLnNlbGVjdCkgfHwgbnVsbDtcblxuICAgICAgICB0aGlzLnNlbGVjdC52YWx1ZSA9IHRoaXMuc2VsZWN0b3JzWzBdW3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGUudG9TdHJpbmcoKTtcblxuICAgICAgICBpZiAoIXNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2F0dGFjaExpc3RlbmVycyh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNlbGVjdENoYW5nZWQoZSkge1xuICAgICAgICB0aGlzLl9nZXRTZWxlY3RvcnMoKTtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRWYWx1ZSA9IGUuY3VycmVudFRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50VmFsdWUgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgcyk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGN1cnJlbnRWYWx1ZSA9PT0gJ2ZhbHNlJykge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5wYXJlbnQuX2ZvY3VzKHRoaXMuc2VsZWN0b3JzKTtcbiAgICB9XG5cbiAgICB1cGRhdGVTZWxlY3QoZSkge1xuICAgICAgICB0aGlzLnNlbGVjdC52YWx1ZSA9IGUuY3VycmVudFRhcmdldFt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlO1xuICAgIH1cblxuICAgIGxpc3RlbmVycygpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlbWEgPSBbXTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKChzLGkpID0+IHtcbiAgICAgICAgICAgIHNjaGVtYS5wdXNoKFtzLCBbXG4gICAgICAgICAgICAgICAgWydmb2N1c0xpc3RlbmVyRm9yU2VsZWN0LScraSwgJ2ZvY3VzJywgZSA9PiB0aGlzLnVwZGF0ZVNlbGVjdC5jYWxsKHRoaXMsIGUpXVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzY2hlbWEucHVzaChbdGhpcy5zZWxlY3QsIFtcbiAgICAgICAgICAgIFsnc2VsZWN0TGlzdGVuZXInLCAnY2hhbmdlJywgZSA9PiB0aGlzLnNlbGVjdENoYW5nZWQuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgXV0pO1xuXG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxuXG4gICAgZW5hYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgcywgdHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QudmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHMsIHRydWUpKTtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0LnZhbHVlID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9nZXRTZWxlY3RvcnMoKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzID0gdGhpcy5sb2NhbFNlbGVjdG9ycyA/IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpKSA6IHRoaXMucGFyZW50LnNlbGVjdG9ycztcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0b3JzO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQuc2VsZWN0LmpzXG4vLyBtb2R1bGUgaWQgPSAzXG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNsYXNzIENoZWNrYm94IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIC8vIEFzc3VtaW5nIHN0YXRlIGlzIGdsb2JhbCBpZiBubyBzZWxlY3RvcnNcbiAgICAgICAgdGhpcy5sb2NhbFNlbGVjdG9ycyA9IHNlbGVjdG9ycztcbiAgICAgICAgdGhpcy5fZ2V0U2VsZWN0b3JzKCk7XG5cbiAgICAgICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBjaGVja2JveDogbnVsbCxcbiAgICAgICAgICAgIGZvY3VzTGlzdGVuZXJGb3JDaGVja2JveDogdHJ1ZSxcbiAgICAgICAgICAgIGNoZWNrYm94TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICBhdXRvU3dpdGNoOiB0cnVlLFxuICAgICAgICB9LCBvcHRzKTtcblxuICAgICAgICB0aGlzLmNoZWNrYm94ID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdHMuY2hlY2tib3gpIHx8IG51bGw7XG5cbiAgICAgICAgdGhpcy5jaGVja2JveC5jaGVja2VkID0gdGhpcy5zZWxlY3RvcnNbMF1bdGhpcy5wYXJlbnQuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZTtcblxuICAgICAgICBpZiAoIXNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2F0dGFjaExpc3RlbmVycyh0aGlzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNoZWNrYm94Q2hhbmdlZChlKSB7XG4gICAgICAgIHRoaXMuX2dldFNlbGVjdG9ycygpO1xuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldC5jaGVja2VkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2VuYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2Rpc2FibGUuY2FsbCh0aGlzLnBhcmVudCwgcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnBhcmVudC5fZm9jdXModGhpcy5zZWxlY3RvcnMpO1xuICAgIH1cblxuICAgIHVwZGF0ZUNoZWNrYm94KGUpIHtcbiAgICAgICAgLy90aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5jaGVja2JveC5jaGVja2VkID0gc1t0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlKTtcbiAgICAgICAgdGhpcy5jaGVja2JveC5jaGVja2VkID0gZS5jdXJyZW50VGFyZ2V0W3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGU7XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5jaGVja2JveCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2NoZW1hID0gW107XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaCgocyxpKSA9PiB7XG4gICAgICAgICAgICBzY2hlbWEucHVzaChbcywgW1xuICAgICAgICAgICAgICAgIFsnZm9jdXNMaXN0ZW5lckZvckNoZWNrYm94LScraSwgJ2ZvY3VzJywgZSA9PiB0aGlzLnVwZGF0ZUNoZWNrYm94LmNhbGwodGhpcywgZSldXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjaGVtYS5wdXNoKFt0aGlzLmNoZWNrYm94LCBbXG4gICAgICAgICAgICBbJ2NoZWNrYm94TGlzdGVuZXInLCAnY2hhbmdlJywgZSA9PiB0aGlzLmNoZWNrYm94Q2hhbmdlZC5jYWxsKHRoaXMsIGUpXVxuICAgICAgICBdXSk7XG5cbiAgICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG5cbiAgICBlbmFibGVkKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgdGhpcy5zZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IuZnJhbWVFbGVtZW50IHx8IHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgcywgdHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5jaGVja2JveC5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2FibGVkKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0b1N3aXRjaCAmJiB0aGlzLnNlbGVjdG9ycy5pbmNsdWRlcyhzZWxlY3Rvci5mcmFtZUVsZW1lbnQgfHwgc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5wYXJlbnQuX2Rpc2FibGUuY2FsbCh0aGlzLnBhcmVudCwgcywgdHJ1ZSkpO1xuICAgICAgICAgICAgdGhpcy5jaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZ2V0U2VsZWN0b3JzKCkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IHRoaXMubG9jYWxTZWxlY3RvcnMgPyBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSkgOiB0aGlzLnBhcmVudC5zZWxlY3RvcnM7XG4gICAgICAgIHJldHVybiB0aGlzLnNlbGVjdG9ycztcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tib3g7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQuY2hlY2tib3guanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgTG9jYWxTdG9yYWdlIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBwYXJhbXM9e30pIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGtleTogJ2dlb2tleWJvYXJkX2dsb2JhbCdcbiAgICAgICAgfSwgcGFyYW1zKTtcblxuICAgICAgICB0aGlzLmxvYWQoKTtcbiAgICB9XG5cbiAgICBlbmFibGVkKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnBhcmFtcy5rZXksIHRydWUpO1xuICAgIH1cblxuICAgIGRpc2FibGVkKCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLnBhcmFtcy5rZXksIGZhbHNlKTtcbiAgICB9XG5cbiAgICBsb2FkKCkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5wYXJhbXMua2V5KSk7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnBhcmVudC5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHN0YXRlID8gdGhpcy5wYXJlbnQuX2VuYWJsZShzKSA6IHRoaXMucGFyZW50Ll9kaXNhYmxlKHMpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gTG9jYWxTdG9yYWdlO1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2dlb2tleWJvYXJkLmxvY2Fsc3RvcmFnZS5qc1xuLy8gbW9kdWxlIGlkID0gNVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjb25zdCBpbnNlcnRBdENhcmV0ID0gKGVsZW1lbnQsIGNvbnRlbnQpID0+IHtcbiAgICBjb25zdCB0YWdOYW1lID0gKGVsZW1lbnQudGFnTmFtZSB8fCBlbGVtZW50LmZyYW1lRWxlbWVudC50YWdOYW1lKTtcblxuICAgIGlmICh0YWdOYW1lID09PSAnRElWJyB8fCB0YWdOYW1lID09PSAnSUZSQU1FJykge1xuICAgICAgICBsZXQgc2VsLCByYW5nZTtcblxuICAgICAgICBsZXQgd2luZG93Q29udGV4dCA9IHdpbmRvdywgZG9jdW1lbnRDb250ZXh0ID0gZG9jdW1lbnQ7XG4gICAgICAgIGlmICh0YWdOYW1lID09PSAnSUZSQU1FJykge1xuICAgICAgICAgICAgd2luZG93Q29udGV4dCA9IGVsZW1lbnQud2luZG93O1xuICAgICAgICAgICAgZG9jdW1lbnRDb250ZXh0ID0gZWxlbWVudC5kb2N1bWVudDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh3aW5kb3dDb250ZXh0LmdldFNlbGVjdGlvbikge1xuICAgICAgICAgICAgc2VsID0gd2luZG93Q29udGV4dC5nZXRTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgIGlmIChzZWwuZ2V0UmFuZ2VBdCAmJiBzZWwucmFuZ2VDb3VudCkge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gc2VsLmdldFJhbmdlQXQoMCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UuZGVsZXRlQ29udGVudHMoKTtcblxuICAgICAgICAgICAgICAgIGxldCBlbCA9IGRvY3VtZW50Q29udGV4dC5jcmVhdGVFbGVtZW50KCdESVYnKTtcbiAgICAgICAgICAgICAgICBlbC5pbm5lckhUTUwgPSBjb250ZW50O1xuICAgICAgICAgICAgICAgIGxldCBmcmFnID0gZG9jdW1lbnRDb250ZXh0LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSwgbm9kZSwgbGFzdE5vZGU7XG4gICAgICAgICAgICAgICAgd2hpbGUgKChub2RlID0gZWwuZmlyc3RDaGlsZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdE5vZGUgPSBmcmFnLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByYW5nZS5pbnNlcnROb2RlKGZyYWcpO1xuXG4gICAgICAgICAgICAgICAgaWYgKGxhc3ROb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlID0gcmFuZ2UuY2xvbmVSYW5nZSgpO1xuICAgICAgICAgICAgICAgICAgICByYW5nZS5zZXRTdGFydEFmdGVyKGxhc3ROb2RlKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsLmFkZFJhbmdlKHJhbmdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZG9jdW1lbnRDb250ZXh0LnNlbGVjdGlvbiAmJiBkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uLnR5cGUgIT09ICdDb250cm9sJykge1xuICAgICAgICAgICAgZG9jdW1lbnRDb250ZXh0LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpLnBhc3RlSFRNTChjb250ZW50KTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGFnTmFtZSA9PT0gJ0lOUFVUJyB8fCB0YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGVsZW1lbnQuc2VsZWN0aW9uRW5kID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgY29uc3Qgc3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvblN0YXJ0O1xuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZWxlbWVudC5zZWxlY3Rpb25FbmQpO1xuICAgICAgICAgICAgZWxlbWVudC5zZWxlY3Rpb25TdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uRW5kID0gc3RhcnQgKyAxO1xuICAgICAgICAgICAgZWxlbWVudC5ibHVyKCk7XG4gICAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCByYW5nZSA9IGRvY3VtZW50LnNlbGVjdGlvbi5jcmVhdGVSYW5nZSgpO1xuICAgICAgICAgICAgbGV0IG5vcm1hbCA9IGVsZW1lbnQudmFsdWUucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcblxuICAgICAgICAgICAgbGV0IHRleHRJbnB1dFJhbmdlID0gZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIHRleHRJbnB1dFJhbmdlLm1vdmVUb0Jvb2ttYXJrKHJhbmdlLmdldEJvb2ttYXJrKCkpO1xuXG4gICAgICAgICAgICBsZXQgZW5kUmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgZW5kUmFuZ2UuY29sbGFwc2UoZmFsc2UpO1xuXG4gICAgICAgICAgICBsZXQgc3RhcnQsIGVuZDtcbiAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdTdGFydFRvRW5kJywgZW5kUmFuZ2UpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gLXRleHRJbnB1dFJhbmdlLm1vdmVTdGFydCgnY2hhcmFjdGVyJywgLWNoYXJMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHN0YXJ0ICs9IG5vcm1hbC5zbGljZSgwLCBzdGFydCkuc3BsaXQoJ1xcbicpLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgICAgICAgICBpZiAodGV4dElucHV0UmFuZ2UuY29tcGFyZUVuZFBvaW50cygnRW5kVG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBjaGFyTGVuZ3RoO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IC10ZXh0SW5wdXRSYW5nZS5tb3ZlRW5kKCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIGVuZCArPSBub3JtYWwuc2xpY2UoMCwgZW5kKS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBlbGVtZW50LnZhbHVlLnNsaWNlKDAsIHN0YXJ0KSArIGNvbnRlbnQgKyBlbGVtZW50LnZhbHVlLnNsaWNlKGVuZCk7XG4gICAgICAgICAgICAvL3N0YXJ0Kys7XG5cbiAgICAgICAgICAgIHRleHRJbnB1dFJhbmdlID0gZWxlbWVudC5jcmVhdGVUZXh0UmFuZ2UoKTtcbiAgICAgICAgICAgIHRleHRJbnB1dFJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnNlcnRBdENhcmV0O1xuXG5cbi8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gV0VCUEFDSyBGT09URVJcbi8vIC4vc3JjL2luc2VydC1hdC1jYXJldC5qc1xuLy8gbW9kdWxlIGlkID0gNlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiXSwic291cmNlUm9vdCI6IiJ9