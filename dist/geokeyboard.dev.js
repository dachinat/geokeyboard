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
            globalHotSwitch: null,
            forceEnabled: false,
            globals: []
        }, params);

        this.listen(selectors, opts);

        if (this.params.forceEnabled) {
            this._forceEnabled();
        }

        this._loadGlobalExtensions();
    }

    [Symbol.call](selectors, params={}, opts={}) {
        return new this.constructor(selectors, params, opts);
    }

    listen(selectors, opts={}, callback=null) {
        this.constructor._warnBadSelector(selectors);

        selectors = Array.from(document.querySelectorAll(selectors));

        selectors.forEach(selector => {
            selector = this.constructor.getContext(selector);

            if (!selector[this.constructor.opts]) {
                selector[this.constructor.opts] = {
                    replaceOnType: true,
                    hotSwitch: true,
                    onChange: null,
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

    attach(ext, params, opts={}) {
        let instance;
        for (let i of this.extensions) {
            if (i instanceof ext) {
                instance = i;
                break;
            }
        }
        if (!instance) {
            instance = Reflect.construct(ext, [this, params, opts]);
        } else {
            instance.redefine(params, opts);
        }
        this.extensions.add(instance);

        const listeners = instance.listeners();
        if (!listeners) {
            return;
        }

        listeners.forEach(element => {
            let selector = document.querySelector(element[0]);

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

        return this;
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

    _enable(selector) {
        selector = this.constructor.getContext(selector);
        selector[this.constructor.opts].replaceOnType = true;

        this.addListener(selector, 'replaceOnType', 'keypress', e => {
            this.constructor._replaceTyped.call(this, e);
        });

        if (selector[this.constructor.opts]['onChange']) {
            selector[this.constructor.opts]['onChange'].call(this, true);
        }

        for (let ext of this.extensions) {
            if (typeof ext.enabled === 'function') {
                ext.enabled.call(ext, selector);
            }
            if (ext.constructor.geokb) {
                ext.constructor.globalEnabled.call(ext);
            }
        }
    }

    _disable(selector) {
        selector = this.constructor.getContext(selector);
        selector[this.constructor.opts].replaceOnType = false;

        const listener = this.getListener(selector, 'replaceOnType');
        if (!listener) {
            return;
        }

        this.removeListener(selector, 'replaceOnType', 'keypress', listener);

        if (selector[this.constructor.opts]['onChange']) {
            selector[this.constructor.opts]['onChange'].call(this, false);
        }

        for (let ext of this.extensions) {
            if (typeof ext.disabled === 'function') {
                ext.disabled.call(ext, selector);
            }
            if (ext.constructor.geokb) {
                ext.constructor.globalDisabled.call(ext);
            }
        }
    }

    _forceEnabled() {
        this.selectors.forEach(s => this._enable(s));
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
            if (typeof this.params.globalHotSwitch === 'function') {
                this.selectors.forEach(s => this._disable(s, s === selector));
                this.params.globalHotSwitch.call(this, false);
            } else {
                this._disable(selector);
            }
        } else {
            if (typeof this.params.globalHotSwitch === 'function') {
                this.selectors.forEach(s => this._enable(s, s === selector));
                this.params.globalHotSwitch.call(this, true);
            } else {
                this._enable(selector);
            }
        }
    }

    _loadGlobalExtensions() {
        this.params.globals.forEach(ext => {
            let found = false;
            for (let instance of this.extensions) {
                if (instance instanceof ext[0]) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.extensions.add(Reflect.construct(ext[0], [this]));
            }
            ext[0].build(this, ext[1]);
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
        return 'geokeyboard';//this.constructor.name;
    }
}

module.exports = Geokeyboard;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

class Select {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.opts = Object.assign({
            select: null,
            focusListenerOnSelect: true,
            selectListener: true,
            autoSwitch: true,
        }, opts);
    }

    redefine(selectors, opts) {
        this.opts = Object.assign(this.opts, opts);
        if (this.selectors) {
            this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
        } else {
            this.selectors = selectors.split(', ');
        }
    }

    listeners() {
        if (this.opts.select === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerOnSelect-'+i, 'focus', e => this.updateSelectValue.call(this, e)]
            ]]);
        });

        schema.push([this.opts.select, [
            ['selectListener', 'change', e => this.changeHandler.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.select).value = 'true';
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.select).value = 'false';
        }
    }

    changeHandler(e) {
        this.selectors.forEach(s => {
            const selector = document.querySelector(s);

            const value = e.currentTarget.value !== 'true';

            if (value === 'true') {
                this.parent._enable.call(this.parent, selector);
            } else if (value === 'false') {
                this.parent._disable.call(this.parent, selector);
            } else {
                return;
            }
        });

        this.parent._focus(Array.from(document.querySelectorAll(this.selectors.join(','))));
    }

    updateSelectValue(e) {
        document.querySelector(this.opts.select).value = e.currentTarget[this.parent.constructor.opts].replaceOnType
            .toString();
    }

    // For global usage
    static build(geokb, params={}) {
        Select.geokb = geokb;

        if (!Select.params) {
            Select.params = {
                select: null,
                focusListener: true,
                autoSwitch: true
            }
        }
        Select.params = Object.assign(Select.params, params);

        const globalSelect = document.querySelector(Select.params.select);

        globalSelect.addEventListener('change', (e) => {
            geokb.selectors.forEach(s => e.currentTarget.value === 'true' ? geokb._enable(s) : geokb._disable(s));
            geokb._focus(geokb.selectors);
        });

        geokb.selectors.forEach(s => {
           s.addEventListener('focus', (e) => {
               if (e.currentTarget[geokb.constructor.opts].replaceOnType) {
                   document.querySelector(Select.params.select).value = 'true';
               } else {
                   document.querySelector(Select.params.select).value = 'false';
               }
           });
        });

        if (geokb.params.forceEnabled) {
            Select.globalEnabled(true);
        }
    }

    static globalEnabled(force) {
        if (Select.params.autoSwitch || force) {
            document.querySelector(Select.params.select).value = 'true';
        }
    }

    static globalDisabled(force) {
        if (Select.params.autoSwitch || force) {
            document.querySelector(Select.params.select).value = 'false';
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

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.lastFocus = null;
        this.opts = Object.assign({
            checkbox: null,
            focusListenerOnCheckbox: true,
            checkboxListener: true,
            autoSwitch: true,
        }, opts);
    }

    changeHandler(e) {
        this.selectors.forEach(s => {
            const selector = document.querySelector(s);

            if (e.currentTarget.checked === true) {
                this.parent._enable.call(this.parent, selector);
            } else {
                this.parent._disable.call(this.parent, selector);
            }
        });

        this.parent._focus(Array.from(document.querySelectorAll(this.selectors)));
    }

    updateCheckbox(e) {
        e.currentTarget.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    // For local usage
    redefine(selectors, opts) {
        this.opts = Object.assign(this.opts, opts);
        if (this.selectors) {
            this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
        } else {
            this.selectors = selectors.split(', ');
        }
    }

    listeners() {
        if (this.opts.checkbox === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerOnCheckbox-'+i, 'focus', e => this.updateCheckbox.call(this, e)]
            ]]);
        });

        schema.push([this.opts.checkbox, [
            ['checkboxListener', 'change', e => this.changeHandler.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.checkbox).checked = true;
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.checkbox).checked = false;
        }
    }

    // For global usage
    static build(geokb, params={}) {
        Checkbox.geokb = geokb;

        if (!Checkbox.params) {
            Checkbox.params = {
                checkbox: null,
                focusListener: true,
                autoSwitch: true
            };
        }
        Checkbox.params = Object.assign(Checkbox.params, params);

        const globalCheckbox = document.querySelector(Checkbox.params.checkbox);

        globalCheckbox.addEventListener('change', (e) => {
            geokb.selectors.forEach(s => e.currentTarget.checked ? geokb._enable(s) : geokb._disable(s));
            geokb._focus(geokb.selectors);
        });

        geokb.selectors.forEach(s => {
            s.addEventListener('focus', (e) => {
                e.currentTarget.checked = e.target.replaceOnType;
            });
        });

        if (geokb.params.forceEnabled) {
            Checkbox.globalEnabled(true);
        }
    }

    static globalEnabled(force) {
        if (Checkbox.params.autoSwitch || force) {
            document.querySelector(Checkbox.params.checkbox).checked = true;
        }
    }

    static globalDisabled(force) {
        if (Checkbox.params.autoSwitch || force) {
            document.querySelector(Checkbox.params.checkbox).checked = false;
        }
    }
}

module.exports = Checkbox;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

class LocalStorage {
    constructor(parent) {
        this.parent = parent;
    }
    // For global usage
    static build(geokb, params={}) {
        LocalStorage.geokb = geokb;

        LocalStorage.params = Object.assign({
            key: 'geokeyboard',
        }, params);

        LocalStorage._load.call(LocalStorage);
    }

    static globalEnabled() {
        if (this.constructor.geokb.params.forceEnabled) {
            return;
        }

        localStorage.setItem(this.constructor.params.key, true);
    }

    static globalDisabled() {
        if (this.constructor.geokb.params.forceEnabled) {
            return;
        }

        localStorage.setItem(this.constructor.params.key, false);
    }

    static _load() {
        if (this.geokb.params.forceEnabled) {
            return;
        }

        const state = JSON.parse(localStorage.getItem(this.params.key));

        if (state === null) {
            return;
        }

        this.geokb.selectors.forEach(s => {
            return state ? this.geokb._enable(s) : this.geokb._disable(s);
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgNDUwMjRjYmUzNjliNjE0NTM0YmEiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1DQUEyQiwwQkFBMEIsRUFBRTtBQUN2RCx5Q0FBaUMsZUFBZTtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw4REFBc0QsK0RBQStEOztBQUVySDtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMEJBQTBCOztBQUUxQixpQzs7Ozs7O0FDUkE7QUFDQSxvQ0FBb0MsU0FBUztBQUM3QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsc0NBQXNDLFNBQVM7QUFDL0M7QUFDQTs7QUFFQSw2QkFBNkI7QUFDN0I7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTs7QUFFYjtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7O0FBRVQ7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUEsK0JBQStCO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQSw0RUFBNEUsYUFBYSxJQUFJLGNBQWM7O0FBRTNHO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxhQUFhOztBQUViO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw0REFBNEQsZUFBZTtBQUMzRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHNCQUFzQixnQ0FBZ0MsU0FBUztBQUM1RjtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDZCQUE2QjtBQUM3QjtBQUNBOztBQUVBLDZCOzs7Ozs7QUNwVEE7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGlDQUFpQztBQUNqQzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBLFlBQVk7QUFDWixTQUFTOztBQUVUO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHdCOzs7Ozs7QUMxSUE7QUFDQSwrQ0FBK0M7QUFDL0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUNBQWlDO0FBQ2pDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUzs7QUFFVDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwwQjs7Ozs7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQ0FBaUM7QUFDakM7O0FBRUE7QUFDQTtBQUNBLFNBQVM7O0FBRVQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQSw4Qjs7Ozs7O0FDaERBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSwrQiIsImZpbGUiOiJnZW9rZXlib2FyZC5kZXYuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHtcbiBcdFx0XHRcdGNvbmZpZ3VyYWJsZTogZmFsc2UsXG4gXHRcdFx0XHRlbnVtZXJhYmxlOiB0cnVlLFxuIFx0XHRcdFx0Z2V0OiBnZXR0ZXJcbiBcdFx0XHR9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSAwKTtcblxuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyB3ZWJwYWNrL2Jvb3RzdHJhcCA0NTAyNGNiZTM2OWI2MTQ1MzRiYSIsImNvbnN0IEdlb2tleWJvYXJkID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZCcpO1xuY29uc3QgU2VsZWN0ID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5zZWxlY3QuanMnKTtcbmNvbnN0IENoZWNrYm94ID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5jaGVja2JveC5qcycpO1xuY29uc3QgTG9jYWxTdG9yYWdlID0gcmVxdWlyZSgnLi9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMnKTtcbmNvbnN0IGluc2VydEF0Q2FyZXQgPSByZXF1aXJlKCcuL2luc2VydC1hdC1jYXJldCcpO1xuXG5HZW9rZXlib2FyZC5leHRlbnNpb25zID0geyBTZWxlY3QsIENoZWNrYm94LCBMb2NhbFN0b3JhZ2UsIGluc2VydEF0Q2FyZXQgfTtcblxud2luZG93Lkdlb2tleWJvYXJkID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvbWFpbi5qc1xuLy8gbW9kdWxlIGlkID0gMVxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBHZW9rZXlib2FyZCB7XG4gICAgY29uc3RydWN0b3Ioc2VsZWN0b3JzLCBwYXJhbXM9e30sIG9wdHM9e30pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBbXTtcbiAgICAgICAgdGhpcy5leHRlbnNpb25zID0gbmV3IFNldDtcbiAgICAgICAgdGhpcy5sYXN0Rm9jdXMgPSBudWxsO1xuXG4gICAgICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBob3RTd2l0Y2hLZXk6IDk2LFxuICAgICAgICAgICAgZ2xvYmFsSG90U3dpdGNoOiBudWxsLFxuICAgICAgICAgICAgZm9yY2VFbmFibGVkOiBmYWxzZSxcbiAgICAgICAgICAgIGdsb2JhbHM6IFtdXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4oc2VsZWN0b3JzLCBvcHRzKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZm9yY2VFbmFibGVkKSB7XG4gICAgICAgICAgICB0aGlzLl9mb3JjZUVuYWJsZWQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRHbG9iYWxFeHRlbnNpb25zKCk7XG4gICAgfVxuXG4gICAgW1N5bWJvbC5jYWxsXShzZWxlY3RvcnMsIHBhcmFtcz17fSwgb3B0cz17fSkge1xuICAgICAgICByZXR1cm4gbmV3IHRoaXMuY29uc3RydWN0b3Ioc2VsZWN0b3JzLCBwYXJhbXMsIG9wdHMpO1xuICAgIH1cblxuICAgIGxpc3RlbihzZWxlY3RvcnMsIG9wdHM9e30sIGNhbGxiYWNrPW51bGwpIHtcbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fd2FybkJhZFNlbGVjdG9yKHNlbGVjdG9ycyk7XG5cbiAgICAgICAgc2VsZWN0b3JzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9ycykpO1xuXG4gICAgICAgIHNlbGVjdG9ycy5mb3JFYWNoKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmVwbGFjZU9uVHlwZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgaG90U3dpdGNoOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBvbkNoYW5nZTogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzOiBbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgb3B0cyk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVR5cGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblBhc3RlJywgJ3Bhc3RlJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVBhc3RlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdob3RTd2l0Y2gnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9ob3RTd2l0Y2guY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnY2hlY2tGb2N1cycsICdmb2N1cycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX2NoZWNrRm9jdXMuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzKSkpO1xuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBzZWxlY3RvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZEdsb2JhbEV4dGVuc2lvbnMoKTtcblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICBhdHRhY2goZXh0LCBwYXJhbXMsIG9wdHM9e30pIHtcbiAgICAgICAgbGV0IGluc3RhbmNlO1xuICAgICAgICBmb3IgKGxldCBpIG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgaWYgKGkgaW5zdGFuY2VvZiBleHQpIHtcbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpbnN0YW5jZSkge1xuICAgICAgICAgICAgaW5zdGFuY2UgPSBSZWZsZWN0LmNvbnN0cnVjdChleHQsIFt0aGlzLCBwYXJhbXMsIG9wdHNdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlLnJlZGVmaW5lKHBhcmFtcywgb3B0cyk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5leHRlbnNpb25zLmFkZChpbnN0YW5jZSk7XG5cbiAgICAgICAgY29uc3QgbGlzdGVuZXJzID0gaW5zdGFuY2UubGlzdGVuZXJzKCk7XG4gICAgICAgIGlmICghbGlzdGVuZXJzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0ZW5lcnMuZm9yRWFjaChlbGVtZW50ID0+IHtcbiAgICAgICAgICAgIGxldCBzZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWxlbWVudFswXSk7XG5cbiAgICAgICAgICAgIGxldCBleHRPcHRzID0gZWxlbWVudFsxXS5yZWR1Y2UoKGFjYywgYykgPT4gT2JqZWN0LmFzc2lnbihhY2MsIHtbY1swXV06IHRydWV9KSwge2xpc3RlbmVyczogW119KTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IGV4dE9wdHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKGV4dE9wdHMsIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgaW5zdGFuY2Uub3B0cyk7XG5cbiAgICAgICAgICAgIGVsZW1lbnRbMV0uZm9yRWFjaChkZXRhaWxzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCBkZXRhaWxzWzBdLCBkZXRhaWxzWzFdLCBkZXRhaWxzWzJdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoW3NlbGVjdG9yXSkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZT1mYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVtsaXN0ZW5lci5zcGxpdCgnLScpWzBdXSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuKSB7XG4gICAgICAgIGNvbnN0IGhhc0xpc3RlbmVyID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgICBpZiAoaGFzTGlzdGVuZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5wdXNoKHtbbGlzdGVuZXJdOiBmbn0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUpIHtcbiAgICAgICAgc2VsZWN0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5zcGxpY2UodGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpLCAxKTtcbiAgICB9XG5cbiAgICBoYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5maW5kSW5kZXgoZiA9PiB0eXBlb2YgZltsaXN0ZW5lcl0gPT09ICdmdW5jdGlvbicpO1xuICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID8gZmFsc2UgOiBpbmRleDtcbiAgICB9XG5cblxuICAgIGdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKTtcbiAgICAgICAgcmV0dXJuIGwgPyBsW2xpc3RlbmVyXSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBfZW5hYmxlKHNlbGVjdG9yKSB7XG4gICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcbiAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlID0gdHJ1ZTtcblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fcmVwbGFjZVR5cGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydvbkNoYW5nZSddKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydvbkNoYW5nZSddLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBleHQgb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4dC5lbmFibGVkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgZXh0LmVuYWJsZWQuY2FsbChleHQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHQuY29uc3RydWN0b3IuZ2Vva2IpIHtcbiAgICAgICAgICAgICAgICBleHQuY29uc3RydWN0b3IuZ2xvYmFsRW5hYmxlZC5jYWxsKGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZGlzYWJsZShzZWxlY3Rvcikge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ29uQ2hhbmdlJ10pIHtcbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c11bJ29uQ2hhbmdlJ10uY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBleHQgb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGV4dC5kaXNhYmxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGV4dC5kaXNhYmxlZC5jYWxsKGV4dCwgc2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGV4dC5jb25zdHJ1Y3Rvci5nZW9rYikge1xuICAgICAgICAgICAgICAgIGV4dC5jb25zdHJ1Y3Rvci5nbG9iYWxEaXNhYmxlZC5jYWxsKGV4dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBfZm9yY2VFbmFibGVkKCkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZW5hYmxlKHMpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX3JlcGxhY2VUeXBlZChlKSB7XG4gICAgICAgIGlmICghbmV3IFJlZ0V4cCh0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5qb2luKCd8JykpLnRlc3QoZS5rZXkpIHx8IGUua2V5Lmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5leHRlbnNpb25zLmluc2VydEF0Q2FyZXQoZS5jdXJyZW50VGFyZ2V0LCBTdHJpbmcuZnJvbUNoYXJDb2RlKFxuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihlLmtleSkgKyA0MzA0KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHN0YXRpYyBfcmVwbGFjZVBhc3RlZChlKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gZS5jbGlwYm9hcmREYXRhID8gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKSA6IHdpbmRvdy5jbGlwYm9hcmREYXRhID9cbiAgICAgICAgICAgIHdpbmRvdy5jbGlwYm9hcmREYXRhLmdldERhdGEoJ1RleHQnKSA6IG51bGw7XG5cbiAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5leHRlbnNpb25zLmluc2VydEF0Q2FyZXQoZS5jdXJyZW50VGFyZ2V0LCBjb250ZW50LnNwbGl0KCcnKVxuICAgICAgICAgICAgLm1hcChjID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmNvbnN0cnVjdG9yLmNoYXJhY3RlclNldC5pbmRleE9mKGMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbmRleCAhPT0gLTEgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKGluZGV4ICsgNDMwNCkgOiBjO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5qb2luKCcnKSk7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfY2hlY2tGb2N1cyhlKSB7XG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgIH1cblxuICAgIF9mb2N1cyhhbW9uZykge1xuICAgICAgICBpZiAodGhpcy5sYXN0Rm9jdXMgJiYgYW1vbmcuaW5jbHVkZXModGhpcy5sYXN0Rm9jdXMuZnJhbWVFbGVtZW50IHx8IHRoaXMubGFzdEZvY3VzKSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0Rm9jdXMuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChhbW9uZ1swXSkuZm9jdXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfaG90U3dpdGNoKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5IHx8IGUud2hpY2ggPT09IHRoaXMucGFyYW1zLmhvdFN3aXRjaEtleSkge1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fdG9nZ2xlLmNhbGwodGhpcywgZS5jdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfdG9nZ2xlKHNlbGVjdG9yKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKTtcblxuICAgICAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyYW1zLmdsb2JhbEhvdFN3aXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLl9kaXNhYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuX2VuYWJsZShzLCBzID09PSBzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1zLmdsb2JhbEhvdFN3aXRjaC5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9lbmFibGUoc2VsZWN0b3IpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2xvYWRHbG9iYWxFeHRlbnNpb25zKCkge1xuICAgICAgICB0aGlzLnBhcmFtcy5nbG9iYWxzLmZvckVhY2goZXh0ID0+IHtcbiAgICAgICAgICAgIGxldCBmb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgZm9yIChsZXQgaW5zdGFuY2Ugb2YgdGhpcy5leHRlbnNpb25zKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlIGluc3RhbmNlb2YgZXh0WzBdKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZXh0ZW5zaW9ucy5hZGQoUmVmbGVjdC5jb25zdHJ1Y3QoZXh0WzBdLCBbdGhpc10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGV4dFswXS5idWlsZCh0aGlzLCBleHRbMV0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX3dhcm5CYWRTZWxlY3RvcihzZWxlY3RvcnMpIHtcbiAgICAgICAgc2VsZWN0b3JzLnNwbGl0KCcsICcpLmZvckVhY2goc2VsZWN0b3IgPT4ge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgLndhcm4oYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfTogQW4gZWxlbWVudCB3aXRoIGlkZW50aWZpZXIgJyR7c2VsZWN0b3J9JyBub3QgZm91bmQuIChTa2lwcGluZy4uLilgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjaGFyYWN0ZXJTZXQoKSB7XG4gICAgICAgIHJldHVybiAnYWJnZGV2elRpa2xtbm9wSnJzdHVmcVJ5U0NjWndXeGpoJy5zcGxpdCgnJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldENvbnRleHQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIChzZWxlY3Rvci50YWdOYW1lID09PSAnSUZSQU1FJykgP1xuICAgICAgICAgICAgKHNlbGVjdG9yLmNvbnRlbnRXaW5kb3cgfHwgc2VsZWN0b3IuY29udGVudERvY3VtZW50KS53aW5kb3cgOiBzZWxlY3RvcjtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IG9wdHMoKSB7XG4gICAgICAgIHJldHVybiAnZ2Vva2V5Ym9hcmQnOy8vdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBHZW9rZXlib2FyZDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9nZW9rZXlib2FyZC5qc1xuLy8gbW9kdWxlIGlkID0gMlxuLy8gbW9kdWxlIGNodW5rcyA9IDAiLCJjbGFzcyBTZWxlY3Qge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgc2VsZWN0b3JzPW51bGwsIG9wdHM9e30pIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnMuc3BsaXQoJywgJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIHNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgIGZvY3VzTGlzdGVuZXJPblNlbGVjdDogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdExpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZSxcbiAgICAgICAgfSwgb3B0cyk7XG4gICAgfVxuXG4gICAgcmVkZWZpbmUoc2VsZWN0b3JzLCBvcHRzKSB7XG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24odGhpcy5vcHRzLCBvcHRzKTtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzLnNwbGl0KCcsICcpKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnMuc3BsaXQoJywgJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuc2VsZWN0ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlbWEgPSBbXTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKChzLGkpID0+IHtcbiAgICAgICAgICAgIHNjaGVtYS5wdXNoKFtzLCBbXG4gICAgICAgICAgICAgICAgWydmb2N1c0xpc3RlbmVyT25TZWxlY3QtJytpLCAnZm9jdXMnLCBlID0+IHRoaXMudXBkYXRlU2VsZWN0VmFsdWUuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgICAgIF1dKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2NoZW1hLnB1c2goW3RoaXMub3B0cy5zZWxlY3QsIFtcbiAgICAgICAgICAgIFsnc2VsZWN0TGlzdGVuZXInLCAnY2hhbmdlJywgZSA9PiB0aGlzLmNoYW5nZUhhbmRsZXIuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgXV0pO1xuXG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxuXG4gICAgZW5hYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuam9pbignLCcpKSk7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0b1N3aXRjaCAmJiBzZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5zZWxlY3QpLnZhbHVlID0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGlzYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLmpvaW4oJywnKSkpO1xuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdHMuc2VsZWN0KS52YWx1ZSA9ICdmYWxzZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGFuZ2VIYW5kbGVyKGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzKTtcblxuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBlLmN1cnJlbnRUYXJnZXQudmFsdWUgIT09ICd0cnVlJztcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZW5hYmxlLmNhbGwodGhpcy5wYXJlbnQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09ICdmYWxzZScpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQuX2ZvY3VzKEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5qb2luKCcsJykpKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlU2VsZWN0VmFsdWUoZSkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5zZWxlY3QpLnZhbHVlID0gZS5jdXJyZW50VGFyZ2V0W3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGVcbiAgICAgICAgICAgIC50b1N0cmluZygpO1xuICAgIH1cblxuICAgIC8vIEZvciBnbG9iYWwgdXNhZ2VcbiAgICBzdGF0aWMgYnVpbGQoZ2Vva2IsIHBhcmFtcz17fSkge1xuICAgICAgICBTZWxlY3QuZ2Vva2IgPSBnZW9rYjtcblxuICAgICAgICBpZiAoIVNlbGVjdC5wYXJhbXMpIHtcbiAgICAgICAgICAgIFNlbGVjdC5wYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0OiBudWxsLFxuICAgICAgICAgICAgICAgIGZvY3VzTGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFNlbGVjdC5wYXJhbXMgPSBPYmplY3QuYXNzaWduKFNlbGVjdC5wYXJhbXMsIHBhcmFtcyk7XG5cbiAgICAgICAgY29uc3QgZ2xvYmFsU2VsZWN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWxlY3QucGFyYW1zLnNlbGVjdCk7XG5cbiAgICAgICAgZ2xvYmFsU2VsZWN0LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICAgICAgICBnZW9rYi5zZWxlY3RvcnMuZm9yRWFjaChzID0+IGUuY3VycmVudFRhcmdldC52YWx1ZSA9PT0gJ3RydWUnID8gZ2Vva2IuX2VuYWJsZShzKSA6IGdlb2tiLl9kaXNhYmxlKHMpKTtcbiAgICAgICAgICAgIGdlb2tiLl9mb2N1cyhnZW9rYi5zZWxlY3RvcnMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBnZW9rYi5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgcy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0W2dlb2tiLmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFNlbGVjdC5wYXJhbXMuc2VsZWN0KS52YWx1ZSA9ICd0cnVlJztcbiAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWxlY3QucGFyYW1zLnNlbGVjdCkudmFsdWUgPSAnZmFsc2UnO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGdlb2tiLnBhcmFtcy5mb3JjZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIFNlbGVjdC5nbG9iYWxFbmFibGVkKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdsb2JhbEVuYWJsZWQoZm9yY2UpIHtcbiAgICAgICAgaWYgKFNlbGVjdC5wYXJhbXMuYXV0b1N3aXRjaCB8fCBmb3JjZSkge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWxlY3QucGFyYW1zLnNlbGVjdCkudmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2xvYmFsRGlzYWJsZWQoZm9yY2UpIHtcbiAgICAgICAgaWYgKFNlbGVjdC5wYXJhbXMuYXV0b1N3aXRjaCB8fCBmb3JjZSkge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWxlY3QucGFyYW1zLnNlbGVjdCkudmFsdWUgPSAnZmFsc2UnO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdDtcblxuXG4vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIFdFQlBBQ0sgRk9PVEVSXG4vLyAuL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanNcbi8vIG1vZHVsZSBpZCA9IDNcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgQ2hlY2tib3gge1xuICAgIGNvbnN0cnVjdG9yKHBhcmVudCwgc2VsZWN0b3JzPW51bGwsIG9wdHM9e30pIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnMuc3BsaXQoJywgJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxhc3RGb2N1cyA9IG51bGw7XG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgY2hlY2tib3g6IG51bGwsXG4gICAgICAgICAgICBmb2N1c0xpc3RlbmVyT25DaGVja2JveDogdHJ1ZSxcbiAgICAgICAgICAgIGNoZWNrYm94TGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICBhdXRvU3dpdGNoOiB0cnVlLFxuICAgICAgICB9LCBvcHRzKTtcbiAgICB9XG5cbiAgICBjaGFuZ2VIYW5kbGVyKGUpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdG9yID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzKTtcblxuICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldC5jaGVja2VkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2VuYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5wYXJlbnQuX2ZvY3VzKEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycykpKTtcbiAgICB9XG5cbiAgICB1cGRhdGVDaGVja2JveChlKSB7XG4gICAgICAgIGUuY3VycmVudFRhcmdldC5jaGVja2VkID0gZS5jdXJyZW50VGFyZ2V0W3RoaXMucGFyZW50LmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGU7XG4gICAgfVxuXG4gICAgLy8gRm9yIGxvY2FsIHVzYWdlXG4gICAgcmVkZWZpbmUoc2VsZWN0b3JzLCBvcHRzKSB7XG4gICAgICAgIHRoaXMub3B0cyA9IE9iamVjdC5hc3NpZ24odGhpcy5vcHRzLCBvcHRzKTtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzLnNwbGl0KCcsICcpKSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBzZWxlY3RvcnMuc3BsaXQoJywgJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW5lcnMoKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuY2hlY2tib3ggPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNjaGVtYSA9IFtdO1xuXG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2goKHMsaSkgPT4ge1xuICAgICAgICAgICAgc2NoZW1hLnB1c2goW3MsIFtcbiAgICAgICAgICAgICAgICBbJ2ZvY3VzTGlzdGVuZXJPbkNoZWNrYm94LScraSwgJ2ZvY3VzJywgZSA9PiB0aGlzLnVwZGF0ZUNoZWNrYm94LmNhbGwodGhpcywgZSldXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjaGVtYS5wdXNoKFt0aGlzLm9wdHMuY2hlY2tib3gsIFtcbiAgICAgICAgICAgIFsnY2hlY2tib3hMaXN0ZW5lcicsICdjaGFuZ2UnLCBlID0+IHRoaXMuY2hhbmdlSGFuZGxlci5jYWxsKHRoaXMsIGUpXVxuICAgICAgICBdXSk7XG5cbiAgICAgICAgcmV0dXJuIHNjaGVtYTtcbiAgICB9XG5cbiAgICBlbmFibGVkKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5qb2luKCcsJykpKTtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHNlbGVjdG9ycy5pbmNsdWRlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLmNoZWNrYm94KS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2FibGVkKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5qb2luKCcsJykpKTtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHNlbGVjdG9ycy5pbmNsdWRlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLmNoZWNrYm94KS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGb3IgZ2xvYmFsIHVzYWdlXG4gICAgc3RhdGljIGJ1aWxkKGdlb2tiLCBwYXJhbXM9e30pIHtcbiAgICAgICAgQ2hlY2tib3guZ2Vva2IgPSBnZW9rYjtcblxuICAgICAgICBpZiAoIUNoZWNrYm94LnBhcmFtcykge1xuICAgICAgICAgICAgQ2hlY2tib3gucGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGNoZWNrYm94OiBudWxsLFxuICAgICAgICAgICAgICAgIGZvY3VzTGlzdGVuZXI6IHRydWUsXG4gICAgICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBDaGVja2JveC5wYXJhbXMgPSBPYmplY3QuYXNzaWduKENoZWNrYm94LnBhcmFtcywgcGFyYW1zKTtcblxuICAgICAgICBjb25zdCBnbG9iYWxDaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ2hlY2tib3gucGFyYW1zLmNoZWNrYm94KTtcblxuICAgICAgICBnbG9iYWxDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZ2Vva2Iuc2VsZWN0b3JzLmZvckVhY2gocyA9PiBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA/IGdlb2tiLl9lbmFibGUocykgOiBnZW9rYi5fZGlzYWJsZShzKSk7XG4gICAgICAgICAgICBnZW9rYi5fZm9jdXMoZ2Vva2Iuc2VsZWN0b3JzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2Vva2Iuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBzLmFkZEV2ZW50TGlzdGVuZXIoJ2ZvY3VzJywgKGUpID0+IHtcbiAgICAgICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA9IGUudGFyZ2V0LnJlcGxhY2VPblR5cGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGdlb2tiLnBhcmFtcy5mb3JjZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIENoZWNrYm94Lmdsb2JhbEVuYWJsZWQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2xvYmFsRW5hYmxlZChmb3JjZSkge1xuICAgICAgICBpZiAoQ2hlY2tib3gucGFyYW1zLmF1dG9Td2l0Y2ggfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ2hlY2tib3gucGFyYW1zLmNoZWNrYm94KS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnbG9iYWxEaXNhYmxlZChmb3JjZSkge1xuICAgICAgICBpZiAoQ2hlY2tib3gucGFyYW1zLmF1dG9Td2l0Y2ggfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoQ2hlY2tib3gucGFyYW1zLmNoZWNrYm94KS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gQ2hlY2tib3g7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQuY2hlY2tib3guanNcbi8vIG1vZHVsZSBpZCA9IDRcbi8vIG1vZHVsZSBjaHVua3MgPSAwIiwiY2xhc3MgTG9jYWxTdG9yYWdlIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gICAgfVxuICAgIC8vIEZvciBnbG9iYWwgdXNhZ2VcbiAgICBzdGF0aWMgYnVpbGQoZ2Vva2IsIHBhcmFtcz17fSkge1xuICAgICAgICBMb2NhbFN0b3JhZ2UuZ2Vva2IgPSBnZW9rYjtcblxuICAgICAgICBMb2NhbFN0b3JhZ2UucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBrZXk6ICdnZW9rZXlib2FyZCcsXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgTG9jYWxTdG9yYWdlLl9sb2FkLmNhbGwoTG9jYWxTdG9yYWdlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2xvYmFsRW5hYmxlZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3RydWN0b3IuZ2Vva2IucGFyYW1zLmZvcmNlRW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0odGhpcy5jb25zdHJ1Y3Rvci5wYXJhbXMua2V5LCB0cnVlKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2xvYmFsRGlzYWJsZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnN0cnVjdG9yLmdlb2tiLnBhcmFtcy5mb3JjZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuY29uc3RydWN0b3IucGFyYW1zLmtleSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfbG9hZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2Vva2IucGFyYW1zLmZvcmNlRW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMucGFyYW1zLmtleSkpO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZW9rYi5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSA/IHRoaXMuZ2Vva2IuX2VuYWJsZShzKSA6IHRoaXMuZ2Vva2IuX2Rpc2FibGUocyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbFN0b3JhZ2U7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvZ2Vva2V5Ym9hcmQubG9jYWxzdG9yYWdlLmpzXG4vLyBtb2R1bGUgaWQgPSA1XG4vLyBtb2R1bGUgY2h1bmtzID0gMCIsImNvbnN0IGluc2VydEF0Q2FyZXQgPSAoZWxlbWVudCwgY29udGVudCkgPT4ge1xuICAgIGNvbnN0IHRhZ05hbWUgPSAoZWxlbWVudC50YWdOYW1lIHx8IGVsZW1lbnQuZnJhbWVFbGVtZW50LnRhZ05hbWUpO1xuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdESVYnIHx8IHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgIGxldCBzZWwsIHJhbmdlO1xuXG4gICAgICAgIGxldCB3aW5kb3dDb250ZXh0ID0gd2luZG93LCBkb2N1bWVudENvbnRleHQgPSBkb2N1bWVudDtcbiAgICAgICAgaWYgKHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgICAgICB3aW5kb3dDb250ZXh0ID0gZWxlbWVudC53aW5kb3c7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQgPSBlbGVtZW50LmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW5kb3dDb250ZXh0LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnRDb250ZXh0LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgbGV0IGZyYWcgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLCBub2RlLCBsYXN0Tm9kZTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoKG5vZGUgPSBlbC5maXJzdENoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0Tm9kZSA9IGZyYWcuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUoZnJhZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0QWZ0ZXIobGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uICYmIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24udHlwZSAhPT0gJ0NvbnRyb2wnKSB7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkucGFzdGVIVE1MKGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgZWxlbWVudC5zZWxlY3Rpb25FbmQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5zbGljZSgwLCBzdGFydCkgKyBjb250ZW50ICsgZWxlbWVudC52YWx1ZS5zbGljZShlbGVtZW50LnNlbGVjdGlvbkVuZCk7XG4gICAgICAgICAgICBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIDE7XG4gICAgICAgICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICBsZXQgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgIGxldCBlbmRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSAtdGV4dElucHV0UmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc3RhcnQgKz0gbm9ybWFsLnNsaWNlKDAsIHN0YXJ0KS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdFbmRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gLXRleHRJbnB1dFJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kICs9IG5vcm1hbC5zbGljZSgwLCBlbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgICAgIC8vc3RhcnQrKztcblxuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEF0Q2FyZXQ7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBXRUJQQUNLIEZPT1RFUlxuLy8gLi9zcmMvaW5zZXJ0LWF0LWNhcmV0LmpzXG4vLyBtb2R1bGUgaWQgPSA2XG4vLyBtb2R1bGUgY2h1bmtzID0gMCJdLCJzb3VyY2VSb290IjoiIn0=