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

"use strict";


var Geokeyboard = __webpack_require__(1);
var Select = __webpack_require__(2);
var Checkbox = __webpack_require__(3);
var LocalStorage = __webpack_require__(4);
var insertAtCaret = __webpack_require__(5);

Geokeyboard.extensions = { Select: Select, Checkbox: Checkbox, LocalStorage: LocalStorage, insertAtCaret: insertAtCaret };

window.Geokeyboard = Geokeyboard;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Geokeyboard = function () {
    function Geokeyboard(selectors) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Geokeyboard);

        this.selectors = [];
        this.extensions = new Set();

        this.lastFocus = null;

        this.params = Object.assign({
            hotSwitchKey: 96,
            change: null, // (fn) Changes other selectors and executes a callback
            globals: []
        }, params);

        this.listen(selectors, opts);

        this._loadGlobalExtensions();
    }

    _createClass(Geokeyboard, [{
        key: Symbol.call,
        value: function value(selectors) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            return new this.constructor(selectors, params, opts);
        }
    }, {
        key: 'listen',
        value: function listen(selectors) {
            var _this = this;

            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            if (!selectors) {
                return this;
            }

            this.constructor._warnBadSelector(selectors);

            selectors = Array.from(document.querySelectorAll(selectors));

            selectors.forEach(function (selector) {
                selector = _this.constructor.getContext(selector);

                if (!selector[_this.constructor.opts]) {
                    selector[_this.constructor.opts] = {
                        replaceOnType: true,
                        replaceOnPaste: false,
                        hotSwitch: true,
                        change: null, // on change callback
                        checkFocus: true,
                        listeners: []
                    };
                }
                selector[_this.constructor.opts] = Object.assign(selector[_this.constructor.opts], opts);

                _this.toggleListener(selector, 'replaceOnType', 'keypress', function (e) {
                    _this.constructor._replaceTyped.call(_this, e);
                });

                _this.toggleListener(selector, 'replaceOnPaste', 'paste', function (e) {
                    _this.constructor._replacePasted.call(_this, e);
                });

                _this.toggleListener(selector, 'hotSwitch', 'keypress', function (e) {
                    _this.constructor._hotSwitch.call(_this, e);
                });

                _this.toggleListener(selector, 'checkFocus', 'focus', function (e) {
                    _this.constructor._checkFocus.call(_this, e);
                }, true);
            });

            this.selectors = Array.from(new Set(this.selectors.concat(selectors)));

            if (callback) {
                callback.call(this, selectors);
            }

            this._loadGlobalExtensions();

            return this;
        }
    }, {
        key: 'attach',
        value: function attach(ext, selectors) {
            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var instance = Reflect.construct(ext, [this, selectors, opts]);
            this.extensions.add(instance);
            this._attachListeners(instance);

            return this;
        }
    }, {
        key: '_attachListeners',
        value: function _attachListeners(instance) {
            var _this2 = this;

            var listeners = instance.listeners();
            if (!listeners) {
                return;
            }

            listeners.forEach(function (element) {
                var selector = element[0];
                var extOpts = element[1].reduce(function (acc, c) {
                    return Object.assign(acc, _defineProperty({}, c[0], true));
                }, { listeners: [] });

                if (!selector[_this2.constructor.opts]) {
                    selector[_this2.constructor.opts] = extOpts;
                } else {
                    selector[_this2.constructor.opts] = Object.assign(extOpts, selector[_this2.constructor.opts]);
                }
                selector[_this2.constructor.opts] = Object.assign(selector[_this2.constructor.opts], instance.opts);

                element[1].forEach(function (details) {
                    _this2.toggleListener(selector, details[0], details[1], details[2]);
                });

                _this2.selectors = Array.from(new Set(_this2.selectors.concat([selector])));
            });
        }
    }, {
        key: 'toggleListener',
        value: function toggleListener(selector, listener, type, fn) {
            var useCapture = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            var index = this.hasListener(selector, listener);

            if (selector[this.constructor.opts][listener.split('-')[0]]) {
                if (index === false) {
                    this.addListener(selector, listener, type, fn, useCapture);
                }
            } else {
                if (index !== false) {
                    this.removeListener(selector, listener, type, useCapture);
                }
            }
        }
    }, {
        key: 'addListener',
        value: function addListener(selector, listener, type, fn) {
            var hasListener = this.hasListener(selector, listener);
            if (hasListener === false) {
                selector[this.constructor.opts].listeners.push(_defineProperty({}, listener, fn));
            }
            selector.addEventListener(type, this.getListener(selector, listener));
        }
    }, {
        key: 'removeListener',
        value: function removeListener(selector, listener, type) {
            selector.removeEventListener(type, this.getListener(selector, listener));
            selector[this.constructor.opts].listeners.splice(this.hasListener(selector, listener), 1);
        }
    }, {
        key: 'hasListener',
        value: function hasListener(selector, listener) {
            var index = selector[this.constructor.opts].listeners.findIndex(function (f) {
                return typeof f[listener] === 'function';
            });
            return index === -1 ? false : index;
        }
    }, {
        key: 'getListener',
        value: function getListener(selector, listener) {
            var l = selector[this.constructor.opts].listeners.find(function (f) {
                return f[listener];
            });
            return l ? l[listener] : undefined;
        }
    }, {
        key: '_enable',
        value: function _enable(selector) {
            var _this3 = this;

            var skip_ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            selector = this.constructor.getContext(selector);
            selector[this.constructor.opts].replaceOnType = true;

            if (selector.hasAttribute && selector.hasAttribute('type') && selector.getAttribute('type') !== 'text') {
                return;
            }

            if (selector[this.constructor.opts]['change'] && this.hasListener(selector, 'replaceOnType') === false) {
                selector[this.constructor.opts]['change'].call(this, true);
            }

            this.addListener(selector, 'replaceOnType', 'keypress', function (e) {
                _this3.constructor._replaceTyped.call(_this3, e);
            });

            if (!skip_ext) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = this.extensions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var ext = _step.value;

                        if (typeof ext.enabled === 'function') {
                            ext.enabled.call(ext, selector);
                        }
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
        }
    }, {
        key: '_disable',
        value: function _disable(selector) {
            var skip_ext = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            selector = this.constructor.getContext(selector);
            selector[this.constructor.opts].replaceOnType = false;

            var listener = this.getListener(selector, 'replaceOnType');
            if (!listener) {
                return;
            }

            if (selector[this.constructor.opts]['change'] && this.hasListener(selector, 'replaceOnType') !== false) {
                selector[this.constructor.opts]['change'].call(this, false);
            }

            this.removeListener(selector, 'replaceOnType', 'keypress', listener);

            if (!skip_ext) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = this.extensions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var ext = _step2.value;

                        if (typeof ext.disabled === 'function') {
                            ext.disabled.call(ext, selector);
                        }
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }
            }
        }
    }, {
        key: '_focus',
        value: function _focus(among) {
            if (this.lastFocus && among.includes(this.lastFocus.frameElement || this.lastFocus)) {
                this.lastFocus.focus();
            } else {
                this.constructor.getContext(among[0]).focus();
            }
        }
    }, {
        key: '_loadGlobalExtensions',
        value: function _loadGlobalExtensions() {
            var _this4 = this;

            this.params.globals.forEach(function (ext) {
                var instance = Reflect.construct(ext[0], [_this4, null, ext[1]]);
                _this4.extensions.add(instance);
            });
        }
    }], [{
        key: '_replaceTyped',
        value: function _replaceTyped(e) {
            if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1) {
                return;
            }
            e.preventDefault();

            this.constructor.extensions.insertAtCaret(e.currentTarget, String.fromCharCode(this.constructor.characterSet.indexOf(e.key) + 4304));
        }
    }, {
        key: '_replacePasted',
        value: function _replacePasted(e) {
            var _this5 = this;

            var content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ? window.clipboardData.getData('Text') : null;

            this.constructor.extensions.insertAtCaret(e.currentTarget, content.split('').map(function (c) {
                var index = _this5.constructor.characterSet.indexOf(c);
                return index !== -1 ? String.fromCharCode(index + 4304) : c;
            }).join(''));

            e.preventDefault();
        }
    }, {
        key: '_checkFocus',
        value: function _checkFocus(e) {
            this.lastFocus = e.currentTarget;
        }
    }, {
        key: '_hotSwitch',
        value: function _hotSwitch(e) {
            if (e.keyCode === this.params.hotSwitchKey || e.which === this.params.hotSwitchKey) {
                this.constructor._toggle.call(this, e.currentTarget);
                e.preventDefault();
            }
        }
    }, {
        key: '_toggle',
        value: function _toggle(selector) {
            var _this6 = this;

            var index = this.hasListener(selector, 'replaceOnType');

            if (index !== false) {
                if (typeof this.params.change === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this6._disable(s, s === selector);
                    });
                    this.params.change.call(this, false);
                } else {
                    this._disable(selector);
                }
            } else {
                if (typeof this.params.change === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this6._enable(s, s === selector);
                    });
                    this.params.change.call(this, true);
                } else {
                    this._enable(selector);
                }
            }
        }
    }, {
        key: '_warnBadSelector',
        value: function _warnBadSelector(selectors) {
            var _this7 = this;

            selectors.split(', ').forEach(function (selector) {
                if (!document.querySelector(selector)) {
                    console.warn(_this7.constructor.name + ': An element with identifier \'' + selector + '\' not found. (Skipping...)');
                    return true;
                }
            });
        }
    }, {
        key: 'getContext',
        value: function getContext(selector) {
            return selector.tagName === 'IFRAME' ? (selector.contentWindow || selector.contentDocument).window : selector;
        }
    }, {
        key: 'characterSet',
        get: function get() {
            return 'abgdevzTiklmnopJrstufqRySCcZwWxjh'.split('');
        }
    }, {
        key: 'opts',
        get: function get() {
            return 'geokeyboard';
        }
    }]);

    return Geokeyboard;
}();

module.exports = Geokeyboard;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Select = function () {
    function Select(parent) {
        var selectors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Select);

        this.parent = parent;

        // Assuming state is global if no selectors
        this.localSelectors = selectors;
        this._getSelectors();

        this.opts = Object.assign({
            select: null,
            focusListenerForSelect: true,
            selectListener: true,
            autoSwitch: true
        }, opts);

        this.select = document.querySelector(this.opts.select) || null;

        this.select.value = this.selectors[0][this.parent.constructor.opts].replaceOnType.toString();

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    _createClass(Select, [{
        key: 'selectChanged',
        value: function selectChanged(e) {
            var _this = this;

            this._getSelectors();
            this.selectors.forEach(function (s) {
                var currentValue = e.currentTarget.value;
                if (currentValue === 'true') {
                    _this.parent._enable.call(_this.parent, s);
                } else if (currentValue === 'false') {
                    _this.parent._disable.call(_this.parent, s);
                }
            });
            this.parent._focus(this.selectors);
        }
    }, {
        key: 'updateSelect',
        value: function updateSelect(e) {
            this.select.value = e.currentTarget[this.parent.constructor.opts].replaceOnType;
        }
    }, {
        key: 'listeners',
        value: function listeners() {
            var _this2 = this;

            if (this.select === null) {
                return;
            }

            var schema = [];

            this.selectors.forEach(function (s, i) {
                schema.push([s, [['focusListenerForSelect-' + i, 'focus', function (e) {
                    return _this2.updateSelect.call(_this2, e);
                }]]]);
            });

            schema.push([this.select, [['selectListener', 'change', function (e) {
                return _this2.selectChanged.call(_this2, e);
            }]]]);

            return schema;
        }
    }, {
        key: 'enabled',
        value: function enabled(selector) {
            var _this3 = this;

            if (!this.selectors) {
                return;
            }

            if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
                this.selectors.forEach(function (s) {
                    return _this3.parent._enable.call(_this3.parent, s, true);
                });
                this.select.value = 'true';
            }
        }
    }, {
        key: 'disabled',
        value: function disabled(selector) {
            var _this4 = this;

            if (!this.selectors) {
                return;
            }

            if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
                this.selectors.forEach(function (s) {
                    return _this4.parent._disable.call(_this4.parent, s, true);
                });
                this.select.value = 'false';
            }
        }
    }, {
        key: '_getSelectors',
        value: function _getSelectors() {
            this.selectors = this.localSelectors ? Array.from(document.querySelectorAll(selectors)) : this.parent.selectors;
            return this.selectors;
        }
    }]);

    return Select;
}();

module.exports = Select;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Checkbox = function () {
    function Checkbox(parent) {
        var selectors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Checkbox);

        this.parent = parent;

        // Assuming state is global if no selectors
        this.localSelectors = selectors;
        this._getSelectors();

        this.opts = Object.assign({
            checkbox: null,
            focusListenerForCheckbox: true,
            checkboxListener: true,
            autoSwitch: true
        }, opts);

        this.checkbox = document.querySelector(this.opts.checkbox) || null;

        this.checkbox.checked = this.selectors[0][this.parent.constructor.opts].replaceOnType;

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    _createClass(Checkbox, [{
        key: 'checkboxChanged',
        value: function checkboxChanged(e) {
            var _this = this;

            this._getSelectors();
            this.selectors.forEach(function (s) {
                if (e.currentTarget.checked === true) {
                    _this.parent._enable.call(_this.parent, s);
                } else {
                    _this.parent._disable.call(_this.parent, s);
                }
            });
            this.parent._focus(this.selectors);
        }
    }, {
        key: 'updateCheckbox',
        value: function updateCheckbox(e) {
            //this.selectors.forEach(s => this.checkbox.checked = s[this.parent.constructor.opts].replaceOnType);
            this.checkbox.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
        }
    }, {
        key: 'listeners',
        value: function listeners() {
            var _this2 = this;

            if (this.checkbox === null) {
                return;
            }

            var schema = [];

            this.selectors.forEach(function (s, i) {
                schema.push([s, [['focusListenerForCheckbox-' + i, 'focus', function (e) {
                    return _this2.updateCheckbox.call(_this2, e);
                }]]]);
            });

            schema.push([this.checkbox, [['checkboxListener', 'change', function (e) {
                return _this2.checkboxChanged.call(_this2, e);
            }]]]);

            return schema;
        }
    }, {
        key: 'enabled',
        value: function enabled(selector) {
            var _this3 = this;

            if (!this.selectors) {
                return;
            }
            if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
                this.selectors.forEach(function (s) {
                    return _this3.parent._enable.call(_this3.parent, s, true);
                });
                this.checkbox.checked = true;
            }
        }
    }, {
        key: 'disabled',
        value: function disabled(selector) {
            var _this4 = this;

            if (!this.selectors) {
                return;
            }

            if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
                this.selectors.forEach(function (s) {
                    return _this4.parent._disable.call(_this4.parent, s, true);
                });
                this.checkbox.checked = false;
            }
        }
    }, {
        key: '_getSelectors',
        value: function _getSelectors() {
            this.selectors = this.localSelectors ? Array.from(document.querySelectorAll(selectors)) : this.parent.selectors;
            return this.selectors;
        }
    }]);

    return Checkbox;
}();

module.exports = Checkbox;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalStorage = function () {
    function LocalStorage(parent) {
        var selectors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, LocalStorage);

        this.parent = parent;

        this.params = Object.assign({
            key: 'geokeyboard_global'
        }, params);

        this.load();
    }

    _createClass(LocalStorage, [{
        key: 'enabled',
        value: function enabled() {
            localStorage.setItem(this.params.key, true);
        }
    }, {
        key: 'disabled',
        value: function disabled() {
            localStorage.setItem(this.params.key, false);
        }
    }, {
        key: 'load',
        value: function load() {
            var _this = this;

            var state = JSON.parse(localStorage.getItem(this.params.key));

            if (state === null) {
                return;
            }

            this.parent.selectors.forEach(function (s) {
                return state ? _this.parent._enable(s) : _this.parent._disable(s);
            });
        }
    }]);

    return LocalStorage;
}();

module.exports = LocalStorage;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var insertAtCaret = function insertAtCaret(element, content) {
    var tagName = element.tagName || element.frameElement.tagName;

    if (tagName === 'DIV' || tagName === 'IFRAME') {
        var sel = void 0,
            range = void 0;

        var windowContext = window,
            documentContext = document;
        if (tagName === 'IFRAME') {
            windowContext = element.window;
            documentContext = element.document;
        }

        if (windowContext.getSelection) {
            sel = windowContext.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                var el = documentContext.createElement('DIV');
                el.innerHTML = content;
                var frag = documentContext.createDocumentFragment(),
                    node = void 0,
                    lastNode = void 0;
                while (node = el.firstChild) {
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
            var start = element.selectionStart;
            element.value = element.value.slice(0, start) + content + element.value.slice(element.selectionEnd);
            element.selectionStart = element.selectionEnd = start + 1;
            element.blur();
            element.focus();
        } else {
            var _range = document.selection.createRange();
            var normal = element.value.replace(/\r\n/g, '\n');

            var textInputRange = element.createTextRange();
            textInputRange.moveToBookmark(_range.getBookmark());

            var endRange = element.createTextRange();
            endRange.collapse(false);

            var _start = void 0,
                end = void 0;
            if (textInputRange.compareEndPoints('StartToEnd', endRange) > -1) {
                _start = end = charLength;
            } else {
                _start = -textInputRange.moveStart('character', -charLength);
                _start += normal.slice(0, _start).split('\n').length - 1;

                if (textInputRange.compareEndPoints('EndToEnd', endRange) > -1) {
                    end = charLength;
                } else {
                    end = -textInputRange.moveEnd('character', -charLength);
                    end += normal.slice(0, end).split('\n').length - 1;
                }
            }

            element.value = element.value.slice(0, _start) + content + element.value.slice(end);
            //start++;

            textInputRange = element.createTextRange();
            textInputRange.collapse(true);
        }
    }
};

module.exports = insertAtCaret;

/***/ })
/******/ ]);
//# sourceMappingURL=geokeyboard.js.map