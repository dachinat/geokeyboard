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

"use strict";


var Geokeyboard = __webpack_require__(2);
var Select = __webpack_require__(3);
var Checkbox = __webpack_require__(4);
var LocalStorage = __webpack_require__(5);
var insertAtCaret = __webpack_require__(6);

Geokeyboard.extensions = { Select: Select, Checkbox: Checkbox, LocalStorage: LocalStorage, insertAtCaret: insertAtCaret };

window.Geokeyboard = Geokeyboard;

/***/ }),
/* 2 */
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

    _createClass(Geokeyboard, [{
        key: 'listen',
        value: function listen(selectors) {
            var _this = this;

            var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var callback = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

            this.constructor._warnBadSelector(selectors);

            selectors = Array.from(document.querySelectorAll(selectors));

            selectors.forEach(function (selector) {
                selector = _this.constructor.getContext(selector);

                if (!selector[_this.constructor.opts]) {
                    selector[_this.constructor.opts] = {
                        replaceOnType: true,
                        hotSwitch: true,
                        onChange: null,
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
        value: function attach(ext, params) {
            var _this2 = this;

            var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var inst = void 0;
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = this.extensions[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var i = _step.value;

                    if (i instanceof ext) {
                        inst = i;
                        break;
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

            if (!inst) {
                inst = Reflect.construct(ext, [this, params, opts]);
            } else {
                inst.redefine(params, opts);
            }
            this.extensions.add(inst);

            var l = inst.listeners();
            if (!l) {
                return;
            }

            l.forEach(function (el) {
                var selector = document.querySelector(el[0]);

                var extOpts = el[1].reduce(function (acc, c) {
                    return Object.assign(acc, _defineProperty({}, c[0], true));
                }, { listeners: [] });

                if (!selector[_this2.constructor.opts]) {
                    selector[_this2.constructor.opts] = extOpts;
                } else {
                    selector[_this2.constructor.opts] = Object.assign(extOpts, selector[_this2.constructor.opts]);
                }
                selector[_this2.constructor.opts] = Object.assign(selector[_this2.constructor.opts], inst.opts);

                el[1].forEach(function (l) {
                    _this2.toggleListener(selector, l[0], l[1], l[2]);
                });

                _this2.selectors = Array.from(new Set(_this2.selectors.concat([selector])));
            });

            return this;
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
            if (!l) {
                //console.warn(`No such listener as '${listener}' for '${selector.outerHTML}'`);
            }
            return l ? l[listener] : undefined;
        }
    }, {
        key: '_enable',
        value: function _enable(selector) {
            var _this3 = this;

            selector = this.constructor.getContext(selector);
            selector[this.constructor.opts].replaceOnType = true;

            this.addListener(selector, 'replaceOnType', 'keypress', function (e) {
                _this3.constructor._replaceTyped.call(_this3, e);
            });

            if (selector[this.constructor.opts]['onChange']) {
                selector[this.constructor.opts]['onChange'].call(this, true);
            }

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = this.extensions[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var ext = _step2.value;

                    if (typeof ext.enabled === 'function') {
                        ext.enabled.call(ext, selector);
                    }
                    if (ext.constructor.geokb) {
                        ext.constructor.globalEnabled.call(ext);
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
    }, {
        key: '_disable',
        value: function _disable(selector) {
            selector = this.constructor.getContext(selector);
            selector[this.constructor.opts].replaceOnType = false;

            var listener = this.getListener(selector, 'replaceOnType');
            if (!listener) {
                return;
            }

            this.removeListener(selector, 'replaceOnType', 'keypress', listener);

            if (selector[this.constructor.opts]['onChange']) {
                selector[this.constructor.opts]['onChange'].call(this, false);
            }

            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
                for (var _iterator3 = this.extensions[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var ext = _step3.value;

                    if (typeof ext.disabled === 'function') {
                        ext.disabled.call(ext, selector);
                    }
                    if (ext.constructor.geokb) {
                        ext.constructor.globalDisabled.call(ext);
                    }
                }
            } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                        _iterator3.return();
                    }
                } finally {
                    if (_didIteratorError3) {
                        throw _iteratorError3;
                    }
                }
            }
        }
    }, {
        key: '_forceEnabled',
        value: function _forceEnabled() {
            var _this4 = this;

            this.selectors.forEach(function (s) {
                return _this4._enable(s);
            });
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
            var _this5 = this;

            this.params.globals.forEach(function (ext) {
                var found = false;
                var _iteratorNormalCompletion4 = true;
                var _didIteratorError4 = false;
                var _iteratorError4 = undefined;

                try {
                    for (var _iterator4 = _this5.extensions[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var instance = _step4.value;

                        if (instance instanceof ext[0]) {
                            found = true;
                            break;
                        }
                    }
                } catch (err) {
                    _didIteratorError4 = true;
                    _iteratorError4 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return) {
                            _iterator4.return();
                        }
                    } finally {
                        if (_didIteratorError4) {
                            throw _iteratorError4;
                        }
                    }
                }

                if (!found) {
                    _this5.extensions.add(Reflect.construct(ext[0], [_this5]));
                }
                ext[0].build(_this5, ext[1]);
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
            var _this6 = this;

            var content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ? window.clipboardData.getData('Text') : null;

            this.constructor.extensions.insertAtCaret(e.currentTarget, content.split('').map(function (c) {
                var index = _this6.constructor.characterSet.indexOf(c);
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
            var _this7 = this;

            var index = this.hasListener(selector, 'replaceOnType');

            if (index !== false) {
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this7._disable(s, s === selector);
                    });
                    this.params.globalHotSwitch.call(this, false);
                } else {
                    this._disable(selector);
                }
            } else {
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this7._enable(s, s === selector);
                    });
                    this.params.globalHotSwitch.call(this, true);
                } else {
                    this._enable(selector);
                }
            }
        }
    }, {
        key: '_warnBadSelector',
        value: function _warnBadSelector(selectors) {
            var _this8 = this;

            selectors.split(', ').forEach(function (selector) {
                if (!document.querySelector(selector)) {
                    console.warn(_this8.constructor.name + ': An element with identifier \'' + selector + '\' not found. (Skipping...)');
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
            return 'geokeyboard'; //this.constructor.name;
        }
    }]);

    return Geokeyboard;
}();

module.exports = Geokeyboard;

/***/ }),
/* 3 */
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

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.opts = Object.assign({
            select: null,
            focusListenerOnSelect: true,
            selectListener: true,
            autoSwitch: true
        }, opts);
    }

    _createClass(Select, [{
        key: 'redefine',
        value: function redefine(selectors, opts) {
            this.opts = Object.assign(this.opts, opts);
            if (this.selectors) {
                this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
            } else {
                this.selectors = selectors.split(', ');
            }
        }
    }, {
        key: 'listeners',
        value: function listeners() {
            var _this = this;

            if (this.opts.select === null) {
                return;
            }

            var schema = [];

            this.selectors.forEach(function (s, i) {
                schema.push([s, [['focusListenerOnSelect-' + i, 'focus', function (e) {
                    return _this.updateSelectValue.call(_this, e);
                }]]]);
            });

            schema.push([this.opts.select, [['selectListener', 'change', function (e) {
                return _this.changeHandler.call(_this, e);
            }]]]);

            return schema;
        }
    }, {
        key: 'enabled',
        value: function enabled(selector) {
            if (!this.selectors) {
                return;
            }

            var selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
            if (this.opts.autoSwitch && selectors.includes(selector)) {
                document.querySelector(this.opts.select).value = 'true';
            }
        }
    }, {
        key: 'disabled',
        value: function disabled(selector) {
            if (!this.selectors) {
                return;
            }

            var selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
            if (this.opts.autoSwitch && selectors.includes(selector)) {
                document.querySelector(this.opts.select).value = 'false';
            }
        }
    }, {
        key: 'changeHandler',
        value: function changeHandler(e) {
            var _this2 = this;

            this.selectors.forEach(function (s) {
                var selector = document.querySelector(s);
                var value = JSON.parse(e.currentTarget.value);

                if (value === true) {
                    _this2.parent._enable.call(_this2.parent, selector);
                } else {
                    _this2.parent._disable.call(_this2.parent, selector);
                }
            });

            this.parent._focus(document.querySelector(this.selectors));
        }
    }, {
        key: 'updateSelectValue',
        value: function updateSelectValue(e) {
            document.querySelector(this.opts.select).value = e.currentTarget[this.parent.constructor.opts].replaceOnType.toString();
        }

        // For global usage

    }], [{
        key: 'build',
        value: function build(geokb) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            Select.geokb = geokb;

            if (!Select.params) {
                Select.params = {
                    select: null,
                    focusListener: true,
                    autoSwitch: true
                };
            }
            Select.params = Object.assign(Select.params, params);

            var globalSelect = document.querySelector(Select.params.select);

            globalSelect.addEventListener('change', function (e) {
                geokb.selectors.forEach(function (s) {
                    return e.currentTarget.value === 'true' ? geokb._enable(s) : geokb._disable(s);
                });
                geokb._focus(geokb.selectors);
            });

            geokb.selectors.forEach(function (s) {
                s.addEventListener('focus', function (e) {
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
    }, {
        key: 'globalEnabled',
        value: function globalEnabled(force) {
            if (Select.params.autoSwitch || force) {
                document.querySelector(Select.params.select).value = 'true';
            }
        }
    }, {
        key: 'globalDisabled',
        value: function globalDisabled(force) {
            if (Select.params.autoSwitch || force) {
                document.querySelector(Select.params.select).value = 'false';
            }
        }
    }]);

    return Select;
}();

module.exports = Select;

/***/ }),
/* 4 */
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

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.lastFocus = null;
        this.opts = Object.assign({
            checkbox: null,
            focusListenerOnCheckbox: true,
            checkboxListener: true,
            autoSwitch: true
        }, opts);
    }

    _createClass(Checkbox, [{
        key: 'changeHandler',
        value: function changeHandler(e) {
            var _this = this;

            this.selectors.forEach(function (s) {
                var selector = document.querySelector(s);

                if (e.currentTarget.checked === true) {
                    _this.parent._enable.call(_this.parent, selector);
                } else {
                    _this.parent._disable.call(_this.parent, selector);
                }
            });

            this.parent._focus(document.querySelector(this.selectors));
        }
    }, {
        key: 'updateCheckbox',
        value: function updateCheckbox(e) {
            e.currentTarget.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
        }

        // For local usage

    }, {
        key: 'redefine',
        value: function redefine(selectors, opts) {
            this.opts = Object.assign(this.opts, opts);
            if (this.selectors) {
                this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
            } else {
                this.selectors = selectors.split(', ');
            }
        }
    }, {
        key: 'listeners',
        value: function listeners() {
            var _this2 = this;

            if (this.opts.checkbox === null) {
                return;
            }

            var schema = [];

            this.selectors.forEach(function (s, i) {
                schema.push([s, [['focusListenerOnCheckbox-' + i, 'focus', function (e) {
                    return _this2.updateCheckbox.call(_this2, e);
                }]]]);
            });

            schema.push([this.opts.checkbox, [['checkboxListener', 'change', function (e) {
                return _this2.changeHandler.call(_this2, e);
            }]]]);

            return schema;
        }
    }, {
        key: 'enabled',
        value: function enabled(selector) {
            if (!this.selectors) {
                return;
            }

            var selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
            if (this.opts.autoSwitch && selectors.includes(selector)) {
                document.querySelector(this.opts.checkbox).checked = true;
            }
        }
    }, {
        key: 'disabled',
        value: function disabled(selector) {
            if (!this.selectors) {
                return;
            }

            var selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
            if (this.opts.autoSwitch && selectors.includes(selector)) {
                document.querySelector(this.opts.checkbox).checked = false;
            }
        }

        // For global usage

    }], [{
        key: 'build',
        value: function build(geokb) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            Checkbox.geokb = geokb;

            if (!Checkbox.params) {
                Checkbox.params = {
                    checkbox: null,
                    focusListener: true,
                    autoSwitch: true
                };
            }
            Checkbox.params = Object.assign(Checkbox.params, params);

            var globalCheckbox = document.querySelector(Checkbox.params.checkbox);

            globalCheckbox.addEventListener('change', function (e) {
                geokb.selectors.forEach(function (s) {
                    return e.currentTarget.checked ? geokb._enable(s) : geokb._disable(s);
                });
                geokb._focus(geokb.selectors);
            });

            geokb.selectors.forEach(function (s) {
                s.addEventListener('focus', function (e) {
                    e.currentTarget.checked = e.target.replaceOnType;
                });
            });

            if (geokb.params.forceEnabled) {
                Checkbox.globalEnabled(true);
            }
        }
    }, {
        key: 'globalEnabled',
        value: function globalEnabled(force) {
            if (Checkbox.params.autoSwitch || force) {
                document.querySelector(Checkbox.params.checkbox).checked = true;
            }
        }
    }, {
        key: 'globalDisabled',
        value: function globalDisabled(force) {
            if (Checkbox.params.autoSwitch || force) {
                document.querySelector(Checkbox.params.checkbox).checked = false;
            }
        }
    }]);

    return Checkbox;
}();

module.exports = Checkbox;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LocalStorage = function () {
    function LocalStorage(parent) {
        _classCallCheck(this, LocalStorage);

        this.parent = parent;
    }
    // For global usage


    _createClass(LocalStorage, null, [{
        key: 'build',
        value: function build(geokb) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            LocalStorage.geokb = geokb;

            LocalStorage.params = Object.assign({
                key: 'geokeyboard'
            }, params);

            LocalStorage._load.call(LocalStorage);
        }
    }, {
        key: 'globalEnabled',
        value: function globalEnabled() {
            console.log('enabled');
            localStorage.setItem(this.constructor.params.key, true);
        }
    }, {
        key: 'globalDisabled',
        value: function globalDisabled() {
            console.log('disabled!!!!');
            localStorage.setItem(this.constructor.params.key, false);
        }
    }, {
        key: '_load',
        value: function _load() {
            var _this = this;

            if (this.geokb.params.forceEnabled) {
                return;
            }

            var state = JSON.parse(localStorage.getItem(this.params.key));

            if (state === null) {
                return;
            }

            this.geokb.selectors.forEach(function (s) {
                return state ? _this.geokb._enable(s) : _this.geokb._disable(s);
            });
        }
    }]);

    return LocalStorage;
}();

module.exports = LocalStorage;

/***/ }),
/* 6 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2YyNzQ0YzBiYjcxOTEzOGIyM2EiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5zZWxlY3QuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzIiwid2VicGFjazovLy8uL3NyYy9nZW9rZXlib2FyZC5sb2NhbHN0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6WyJHZW9rZXlib2FyZCIsInJlcXVpcmUiLCJTZWxlY3QiLCJDaGVja2JveCIsIkxvY2FsU3RvcmFnZSIsImluc2VydEF0Q2FyZXQiLCJleHRlbnNpb25zIiwid2luZG93Iiwic2VsZWN0b3JzIiwicGFyYW1zIiwib3B0cyIsIlNldCIsImxhc3RGb2N1cyIsIk9iamVjdCIsImFzc2lnbiIsImhvdFN3aXRjaEtleSIsImdsb2JhbEhvdFN3aXRjaCIsImZvcmNlRW5hYmxlZCIsImdsb2JhbHMiLCJsaXN0ZW4iLCJfZm9yY2VFbmFibGVkIiwiX2xvYWRHbG9iYWxFeHRlbnNpb25zIiwiY2FsbGJhY2siLCJjb25zdHJ1Y3RvciIsIl93YXJuQmFkU2VsZWN0b3IiLCJBcnJheSIsImZyb20iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwic2VsZWN0b3IiLCJnZXRDb250ZXh0IiwicmVwbGFjZU9uVHlwZSIsImhvdFN3aXRjaCIsIm9uQ2hhbmdlIiwiY2hlY2tGb2N1cyIsImxpc3RlbmVycyIsInRvZ2dsZUxpc3RlbmVyIiwiX3JlcGxhY2VUeXBlZCIsImNhbGwiLCJlIiwiX3JlcGxhY2VQYXN0ZWQiLCJfaG90U3dpdGNoIiwiX2NoZWNrRm9jdXMiLCJjb25jYXQiLCJleHQiLCJpbnN0IiwiaSIsIlJlZmxlY3QiLCJjb25zdHJ1Y3QiLCJyZWRlZmluZSIsImFkZCIsImwiLCJxdWVyeVNlbGVjdG9yIiwiZWwiLCJleHRPcHRzIiwicmVkdWNlIiwiYWNjIiwiYyIsImxpc3RlbmVyIiwidHlwZSIsImZuIiwidXNlQ2FwdHVyZSIsImluZGV4IiwiaGFzTGlzdGVuZXIiLCJzcGxpdCIsImFkZExpc3RlbmVyIiwicmVtb3ZlTGlzdGVuZXIiLCJwdXNoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImdldExpc3RlbmVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsInNwbGljZSIsImZpbmRJbmRleCIsImYiLCJmaW5kIiwidW5kZWZpbmVkIiwiZW5hYmxlZCIsImdlb2tiIiwiZ2xvYmFsRW5hYmxlZCIsImRpc2FibGVkIiwiZ2xvYmFsRGlzYWJsZWQiLCJfZW5hYmxlIiwicyIsImFtb25nIiwiaW5jbHVkZXMiLCJmcmFtZUVsZW1lbnQiLCJmb2N1cyIsImZvdW5kIiwiaW5zdGFuY2UiLCJidWlsZCIsIlJlZ0V4cCIsImNoYXJhY3RlclNldCIsImpvaW4iLCJ0ZXN0Iiwia2V5IiwibGVuZ3RoIiwicHJldmVudERlZmF1bHQiLCJjdXJyZW50VGFyZ2V0IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaW5kZXhPZiIsImNvbnRlbnQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsIm1hcCIsImtleUNvZGUiLCJ3aGljaCIsIl90b2dnbGUiLCJfZGlzYWJsZSIsImNvbnNvbGUiLCJ3YXJuIiwibmFtZSIsInRhZ05hbWUiLCJjb250ZW50V2luZG93IiwiY29udGVudERvY3VtZW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInBhcmVudCIsInNlbGVjdCIsImZvY3VzTGlzdGVuZXJPblNlbGVjdCIsInNlbGVjdExpc3RlbmVyIiwiYXV0b1N3aXRjaCIsInNjaGVtYSIsInVwZGF0ZVNlbGVjdFZhbHVlIiwiY2hhbmdlSGFuZGxlciIsInZhbHVlIiwiSlNPTiIsInBhcnNlIiwiX2ZvY3VzIiwidG9TdHJpbmciLCJmb2N1c0xpc3RlbmVyIiwiZ2xvYmFsU2VsZWN0IiwiZm9yY2UiLCJjaGVja2JveCIsImZvY3VzTGlzdGVuZXJPbkNoZWNrYm94IiwiY2hlY2tib3hMaXN0ZW5lciIsImNoZWNrZWQiLCJ1cGRhdGVDaGVja2JveCIsImdsb2JhbENoZWNrYm94IiwidGFyZ2V0IiwiX2xvYWQiLCJsb2ciLCJsb2NhbFN0b3JhZ2UiLCJzZXRJdGVtIiwic3RhdGUiLCJnZXRJdGVtIiwiZWxlbWVudCIsInNlbCIsInJhbmdlIiwid2luZG93Q29udGV4dCIsImRvY3VtZW50Q29udGV4dCIsImdldFNlbGVjdGlvbiIsImdldFJhbmdlQXQiLCJyYW5nZUNvdW50IiwiZGVsZXRlQ29udGVudHMiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiZnJhZyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJub2RlIiwibGFzdE5vZGUiLCJmaXJzdENoaWxkIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnROb2RlIiwiY2xvbmVSYW5nZSIsInNldFN0YXJ0QWZ0ZXIiLCJjb2xsYXBzZSIsInJlbW92ZUFsbFJhbmdlcyIsImFkZFJhbmdlIiwic2VsZWN0aW9uIiwiY3JlYXRlUmFuZ2UiLCJwYXN0ZUhUTUwiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsInN0YXJ0Iiwic2xpY2UiLCJibHVyIiwibm9ybWFsIiwicmVwbGFjZSIsInRleHRJbnB1dFJhbmdlIiwiY3JlYXRlVGV4dFJhbmdlIiwibW92ZVRvQm9va21hcmsiLCJnZXRCb29rbWFyayIsImVuZFJhbmdlIiwiZW5kIiwiY29tcGFyZUVuZFBvaW50cyIsImNoYXJMZW5ndGgiLCJtb3ZlU3RhcnQiLCJtb3ZlRW5kIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtB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QixDQUEyQixJQUEzQixFQUFpQytCLE1BQWpDLEdBQTBDLENBQWpEO0FBQ0g7QUFDSjs7QUFFRG1ELG9CQUFRckIsS0FBUixHQUFnQnFCLFFBQVFyQixLQUFSLENBQWNrRCxLQUFkLENBQW9CLENBQXBCLEVBQXVCRCxNQUF2QixJQUFnQ3pFLE9BQWhDLEdBQTBDNkMsUUFBUXJCLEtBQVIsQ0FBY2tELEtBQWQsQ0FBb0JTLEdBQXBCLENBQTFEO0FBQ0E7O0FBRUFMLDZCQUFpQmpDLFFBQVFrQyxlQUFSLEVBQWpCO0FBQ0FELDJCQUFlYixRQUFmLENBQXdCLElBQXhCO0FBQ0g7QUFDSjtBQUNKLENBNUVEOztBQThFQW5ELE9BQU9DLE9BQVAsR0FBaUJoSCxhQUFqQixDIiwiZmlsZSI6Imdlb2tleWJvYXJkLmRldi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDdmMjc0NGMwYmI3MTkxMzhiMjNhIiwiY29uc3QgR2Vva2V5Ym9hcmQgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkJyk7XG5jb25zdCBTZWxlY3QgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLnNlbGVjdC5qcycpO1xuY29uc3QgQ2hlY2tib3ggPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLmNoZWNrYm94LmpzJyk7XG5jb25zdCBMb2NhbFN0b3JhZ2UgPSByZXF1aXJlKCcuL2dlb2tleWJvYXJkLmxvY2Fsc3RvcmFnZS5qcycpO1xuY29uc3QgaW5zZXJ0QXRDYXJldCA9IHJlcXVpcmUoJy4vaW5zZXJ0LWF0LWNhcmV0Jyk7XG5cbkdlb2tleWJvYXJkLmV4dGVuc2lvbnMgPSB7IFNlbGVjdCwgQ2hlY2tib3gsIExvY2FsU3RvcmFnZSwgaW5zZXJ0QXRDYXJldCB9O1xuXG53aW5kb3cuR2Vva2V5Ym9hcmQgPSBHZW9rZXlib2FyZDtcblxuXG4vLyBXRUJQQUNLIEZPT1RFUiAvL1xuLy8gLi9zcmMvbWFpbi5qcyIsImNsYXNzIEdlb2tleWJvYXJkIHtcbiAgICBjb25zdHJ1Y3RvcihzZWxlY3RvcnMsIHBhcmFtcz17fSwgb3B0cz17fSkge1xuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IFtdO1xuICAgICAgICB0aGlzLmV4dGVuc2lvbnMgPSBuZXcgU2V0O1xuICAgICAgICB0aGlzLmxhc3RGb2N1cyA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGhvdFN3aXRjaEtleTogOTYsXG4gICAgICAgICAgICBnbG9iYWxIb3RTd2l0Y2g6IG51bGwsXG4gICAgICAgICAgICBmb3JjZUVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICAgICAgZ2xvYmFsczogW11cbiAgICAgICAgfSwgcGFyYW1zKTtcblxuICAgICAgICB0aGlzLmxpc3RlbihzZWxlY3RvcnMsIG9wdHMpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy5mb3JjZUVuYWJsZWQpIHtcbiAgICAgICAgICAgIHRoaXMuX2ZvcmNlRW5hYmxlZCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fbG9hZEdsb2JhbEV4dGVuc2lvbnMoKTtcbiAgICB9XG5cbiAgICBsaXN0ZW4oc2VsZWN0b3JzLCBvcHRzPXt9LCBjYWxsYmFjaz1udWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3dhcm5CYWRTZWxlY3RvcihzZWxlY3RvcnMpO1xuXG4gICAgICAgIHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpKTtcblxuICAgICAgICBzZWxlY3RvcnMuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSkge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VPblR5cGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhvdFN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrRm9jdXM6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGxpc3RlbmVyczogW10sXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10sIG9wdHMpO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25QYXN0ZScsICdwYXN0ZScsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VQYXN0ZWQuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnaG90U3dpdGNoJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5faG90U3dpdGNoLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ2NoZWNrRm9jdXMnLCAnZm9jdXMnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9jaGVja0ZvY3VzLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KHNlbGVjdG9ycykpKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2xvYWRHbG9iYWxFeHRlbnNpb25zKCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgYXR0YWNoKGV4dCwgcGFyYW1zLCBvcHRzPXt9KSB7XG4gICAgICAgIGxldCBpbnN0O1xuICAgICAgICBmb3IgKGxldCBpIG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgaWYgKGkgaW5zdGFuY2VvZiBleHQpIHtcbiAgICAgICAgICAgICAgICBpbnN0ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWluc3QpIHtcbiAgICAgICAgICAgIGluc3QgPSBSZWZsZWN0LmNvbnN0cnVjdChleHQsIFt0aGlzLCBwYXJhbXMsIG9wdHNdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3QucmVkZWZpbmUocGFyYW1zLCBvcHRzKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmV4dGVuc2lvbnMuYWRkKGluc3QpO1xuXG4gICAgICAgIGNvbnN0IGwgPSBpbnN0Lmxpc3RlbmVycygpO1xuICAgICAgICBpZiAoIWwpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGwuZm9yRWFjaChlbCA9PiB7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGVsWzBdKTtcblxuICAgICAgICAgICAgbGV0IGV4dE9wdHMgPSBlbFsxXS5yZWR1Y2UoKGFjYywgYykgPT4gT2JqZWN0LmFzc2lnbihhY2MsIHtbY1swXV06IHRydWV9KSwge2xpc3RlbmVyczogW119KTtcblxuICAgICAgICAgICAgaWYgKCFzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdKSB7XG4gICAgICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IGV4dE9wdHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10gPSBPYmplY3QuYXNzaWduKGV4dE9wdHMsIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXSwgaW5zdC5vcHRzKTtcblxuICAgICAgICAgICAgZWxbMV0uZm9yRWFjaChsID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCBsWzBdLCBsWzFdLCBsWzJdKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoW3NlbGVjdG9yXSkpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZT1mYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVtsaXN0ZW5lci5zcGxpdCgnLScpWzBdXSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuKSB7XG4gICAgICAgIGNvbnN0IGhhc0xpc3RlbmVyID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpO1xuICAgICAgICBpZiAoaGFzTGlzdGVuZXIgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5wdXNoKHtbbGlzdGVuZXJdOiBmbn0pO1xuICAgICAgICB9XG4gICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUpIHtcbiAgICAgICAgc2VsZWN0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5zcGxpY2UodGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpLCAxKTtcbiAgICB9XG5cbiAgICBoYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLmxpc3RlbmVycy5maW5kSW5kZXgoZiA9PiB0eXBlb2YgZltsaXN0ZW5lcl0gPT09ICdmdW5jdGlvbicpO1xuICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID8gZmFsc2UgOiBpbmRleDtcbiAgICB9XG5cblxuICAgIGdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsID0gc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXS5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKTtcbiAgICAgICAgaWYgKCFsKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUud2FybihgTm8gc3VjaCBsaXN0ZW5lciBhcyAnJHtsaXN0ZW5lcn0nIGZvciAnJHtzZWxlY3Rvci5vdXRlckhUTUx9J2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsID8gbFtsaXN0ZW5lcl0gOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgX2VuYWJsZShzZWxlY3Rvcikge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yW3RoaXMuY29uc3RydWN0b3Iub3B0c10ucmVwbGFjZU9uVHlwZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnb25DaGFuZ2UnXSkge1xuICAgICAgICAgICAgc2VsZWN0b3JbdGhpcy5jb25zdHJ1Y3Rvci5vcHRzXVsnb25DaGFuZ2UnXS5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgZXh0IG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHQuZW5hYmxlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGV4dC5lbmFibGVkLmNhbGwoZXh0LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZXh0LmNvbnN0cnVjdG9yLmdlb2tiKSB7XG4gICAgICAgICAgICAgICAgZXh0LmNvbnN0cnVjdG9yLmdsb2JhbEVuYWJsZWQuY2FsbChleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Rpc2FibGUoc2VsZWN0b3IpIHtcbiAgICAgICAgc2VsZWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3IpO1xuICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdLnJlcGxhY2VPblR5cGUgPSBmYWxzZTtcblxuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IHRoaXMuZ2V0TGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJyk7XG4gICAgICAgIGlmICghbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJywgJ2tleXByZXNzJywgbGlzdGVuZXIpO1xuXG4gICAgICAgIGlmIChzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydvbkNoYW5nZSddKSB7XG4gICAgICAgICAgICBzZWxlY3Rvclt0aGlzLmNvbnN0cnVjdG9yLm9wdHNdWydvbkNoYW5nZSddLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgZXh0IG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBleHQuZGlzYWJsZWQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICBleHQuZGlzYWJsZWQuY2FsbChleHQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChleHQuY29uc3RydWN0b3IuZ2Vva2IpIHtcbiAgICAgICAgICAgICAgICBleHQuY29uc3RydWN0b3IuZ2xvYmFsRGlzYWJsZWQuY2FsbChleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2ZvcmNlRW5hYmxlZCgpIHtcbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHRoaXMuX2VuYWJsZShzKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlVHlwZWQoZSkge1xuICAgICAgICBpZiAoIW5ldyBSZWdFeHAodGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuam9pbignfCcpKS50ZXN0KGUua2V5KSB8fCBlLmtleS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuZXh0ZW5zaW9ucy5pbnNlcnRBdENhcmV0KGUuY3VycmVudFRhcmdldCwgU3RyaW5nLmZyb21DaGFyQ29kZShcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmluZGV4T2YoZS5rZXkpICsgNDMwNClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX3JlcGxhY2VQYXN0ZWQoZSkge1xuICAgICAgICBsZXQgY29udGVudCA9IGUuY2xpcGJvYXJkRGF0YSA/IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJykgOiB3aW5kb3cuY2xpcGJvYXJkRGF0YSA/XG4gICAgICAgICAgICB3aW5kb3cuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCdUZXh0JykgOiBudWxsO1xuXG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuZXh0ZW5zaW9ucy5pbnNlcnRBdENhcmV0KGUuY3VycmVudFRhcmdldCwgY29udGVudC5zcGxpdCgnJylcbiAgICAgICAgICAgIC5tYXAoYyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggIT09IC0xID8gU3RyaW5nLmZyb21DaGFyQ29kZShpbmRleCArIDQzMDQpIDogYztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignJykpO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2NoZWNrRm9jdXMoZSkge1xuICAgICAgICB0aGlzLmxhc3RGb2N1cyA9IGUuY3VycmVudFRhcmdldDtcbiAgICB9XG5cbiAgICBfZm9jdXMoYW1vbmcpIHtcbiAgICAgICAgaWYgKHRoaXMubGFzdEZvY3VzICYmIGFtb25nLmluY2x1ZGVzKHRoaXMubGFzdEZvY3VzLmZyYW1lRWxlbWVudCB8fCB0aGlzLmxhc3RGb2N1cykpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdEZvY3VzLmZvY3VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoYW1vbmdbMF0pLmZvY3VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX2hvdFN3aXRjaChlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IHRoaXMucGFyYW1zLmhvdFN3aXRjaEtleSB8fCBlLndoaWNoID09PSB0aGlzLnBhcmFtcy5ob3RTd2l0Y2hLZXkpIHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3RvZ2dsZS5jYWxsKHRoaXMsIGUuY3VycmVudFRhcmdldCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX3RvZ2dsZShzZWxlY3Rvcikge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJyk7XG5cbiAgICAgICAgaWYgKGluZGV4ICE9PSBmYWxzZSkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnBhcmFtcy5nbG9iYWxIb3RTd2l0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZGlzYWJsZShzLCBzID09PSBzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgIHRoaXMucGFyYW1zLmdsb2JhbEhvdFN3aXRjaC5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZGlzYWJsZShzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucGFyYW1zLmdsb2JhbEhvdFN3aXRjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB0aGlzLl9lbmFibGUocywgcyA9PT0gc2VsZWN0b3IpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtcy5nbG9iYWxIb3RTd2l0Y2guY2FsbCh0aGlzLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fZW5hYmxlKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9sb2FkR2xvYmFsRXh0ZW5zaW9ucygpIHtcbiAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFscy5mb3JFYWNoKGV4dCA9PiB7XG4gICAgICAgICAgICBsZXQgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgIGZvciAobGV0IGluc3RhbmNlIG9mIHRoaXMuZXh0ZW5zaW9ucykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSBpbnN0YW5jZW9mIGV4dFswXSkge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmV4dGVuc2lvbnMuYWRkKFJlZmxlY3QuY29uc3RydWN0KGV4dFswXSwgW3RoaXNdKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBleHRbMF0uYnVpbGQodGhpcywgZXh0WzFdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF93YXJuQmFkU2VsZWN0b3Ioc2VsZWN0b3JzKSB7XG4gICAgICAgIHNlbGVjdG9ycy5zcGxpdCgnLCAnKS5mb3JFYWNoKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlXG4gICAgICAgICAgICAgICAgICAgIC53YXJuKGAke3RoaXMuY29uc3RydWN0b3IubmFtZX06IEFuIGVsZW1lbnQgd2l0aCBpZGVudGlmaWVyICcke3NlbGVjdG9yfScgbm90IGZvdW5kLiAoU2tpcHBpbmcuLi4pYCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXQgY2hhcmFjdGVyU2V0KCkge1xuICAgICAgICByZXR1cm4gJ2FiZ2RldnpUaWtsbW5vcEpyc3R1ZnFSeVNDY1p3V3hqaCcuc3BsaXQoJycpO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRDb250ZXh0KHNlbGVjdG9yKSB7XG4gICAgICAgIHJldHVybiAoc2VsZWN0b3IudGFnTmFtZSA9PT0gJ0lGUkFNRScpID9cbiAgICAgICAgICAgIChzZWxlY3Rvci5jb250ZW50V2luZG93IHx8IHNlbGVjdG9yLmNvbnRlbnREb2N1bWVudCkud2luZG93IDogc2VsZWN0b3I7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBvcHRzKCkge1xuICAgICAgICByZXR1cm4gJ2dlb2tleWJvYXJkJzsvL3RoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2dlb2tleWJvYXJkLmpzIiwiY2xhc3MgU2VsZWN0IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIGlmIChzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzLnNwbGl0KCcsICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgICAgICBzZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICBmb2N1c0xpc3RlbmVyT25TZWxlY3Q6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RMaXN0ZW5lcjogdHJ1ZSxcbiAgICAgICAgICAgIGF1dG9Td2l0Y2g6IHRydWUsXG4gICAgICAgIH0sIG9wdHMpO1xuICAgIH1cblxuICAgIHJlZGVmaW5lKHNlbGVjdG9ycywgb3B0cykge1xuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0cywgb3B0cyk7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KHNlbGVjdG9ycy5zcGxpdCgnLCAnKSkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzLnNwbGl0KCcsICcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLnNlbGVjdCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2NoZW1hID0gW107XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMuZm9yRWFjaCgocyxpKSA9PiB7XG4gICAgICAgICAgICBzY2hlbWEucHVzaChbcywgW1xuICAgICAgICAgICAgICAgIFsnZm9jdXNMaXN0ZW5lck9uU2VsZWN0LScraSwgJ2ZvY3VzJywgZSA9PiB0aGlzLnVwZGF0ZVNlbGVjdFZhbHVlLmNhbGwodGhpcywgZSldXG4gICAgICAgICAgICBdXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNjaGVtYS5wdXNoKFt0aGlzLm9wdHMuc2VsZWN0LCBbXG4gICAgICAgICAgICBbJ3NlbGVjdExpc3RlbmVyJywgJ2NoYW5nZScsIGUgPT4gdGhpcy5jaGFuZ2VIYW5kbGVyLmNhbGwodGhpcywgZSldXG4gICAgICAgIF1dKTtcblxuICAgICAgICByZXR1cm4gc2NoZW1hO1xuICAgIH1cblxuICAgIGVuYWJsZWQoc2VsZWN0b3IpIHtcbiAgICAgICAgaWYgKCF0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2VsZWN0b3JzID0gQXJyYXkuZnJvbShkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuc2VsZWN0b3JzLmpvaW4oJywnKSkpO1xuICAgICAgICBpZiAodGhpcy5vcHRzLmF1dG9Td2l0Y2ggJiYgc2VsZWN0b3JzLmluY2x1ZGVzKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdHMuc2VsZWN0KS52YWx1ZSA9ICd0cnVlJztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGRpc2FibGVkKHNlbGVjdG9yKSB7XG4gICAgICAgIGlmICghdGhpcy5zZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCh0aGlzLnNlbGVjdG9ycy5qb2luKCcsJykpKTtcbiAgICAgICAgaWYgKHRoaXMub3B0cy5hdXRvU3dpdGNoICYmIHNlbGVjdG9ycy5pbmNsdWRlcyhzZWxlY3RvcikpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5vcHRzLnNlbGVjdCkudmFsdWUgPSAnZmFsc2UnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2hhbmdlSGFuZGxlcihlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocyk7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IEpTT04ucGFyc2UoZS5jdXJyZW50VGFyZ2V0LnZhbHVlKTtcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuX2VuYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9kaXNhYmxlLmNhbGwodGhpcy5wYXJlbnQsIHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgICAgICB0aGlzLnBhcmVudC5fZm9jdXMoZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnNlbGVjdG9ycykpO1xuICAgIH1cblxuICAgIHVwZGF0ZVNlbGVjdFZhbHVlKGUpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLm9wdHMuc2VsZWN0KS52YWx1ZSA9IGUuY3VycmVudFRhcmdldFt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlXG4gICAgICAgICAgICAudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICAvLyBGb3IgZ2xvYmFsIHVzYWdlXG4gICAgc3RhdGljIGJ1aWxkKGdlb2tiLCBwYXJhbXM9e30pIHtcbiAgICAgICAgU2VsZWN0Lmdlb2tiID0gZ2Vva2I7XG5cbiAgICAgICAgaWYgKCFTZWxlY3QucGFyYW1zKSB7XG4gICAgICAgICAgICBTZWxlY3QucGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIHNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgICAgICBmb2N1c0xpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGF1dG9Td2l0Y2g6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBTZWxlY3QucGFyYW1zID0gT2JqZWN0LmFzc2lnbihTZWxlY3QucGFyYW1zLCBwYXJhbXMpO1xuXG4gICAgICAgIGNvbnN0IGdsb2JhbFNlbGVjdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VsZWN0LnBhcmFtcy5zZWxlY3QpO1xuXG4gICAgICAgIGdsb2JhbFNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgICAgICAgZ2Vva2Iuc2VsZWN0b3JzLmZvckVhY2gocyA9PiBlLmN1cnJlbnRUYXJnZXQudmFsdWUgPT09ICd0cnVlJyA/IGdlb2tiLl9lbmFibGUocykgOiBnZW9rYi5fZGlzYWJsZShzKSk7XG4gICAgICAgICAgICBnZW9rYi5fZm9jdXMoZ2Vva2Iuc2VsZWN0b3JzKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZ2Vva2Iuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgIHMuYWRkRXZlbnRMaXN0ZW5lcignZm9jdXMnLCAoZSkgPT4ge1xuICAgICAgICAgICAgICAgaWYgKGUuY3VycmVudFRhcmdldFtnZW9rYi5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihTZWxlY3QucGFyYW1zLnNlbGVjdCkudmFsdWUgPSAndHJ1ZSc7XG4gICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VsZWN0LnBhcmFtcy5zZWxlY3QpLnZhbHVlID0gJ2ZhbHNlJztcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChnZW9rYi5wYXJhbXMuZm9yY2VFbmFibGVkKSB7XG4gICAgICAgICAgICBTZWxlY3QuZ2xvYmFsRW5hYmxlZCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBnbG9iYWxFbmFibGVkKGZvcmNlKSB7XG4gICAgICAgIGlmIChTZWxlY3QucGFyYW1zLmF1dG9Td2l0Y2ggfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VsZWN0LnBhcmFtcy5zZWxlY3QpLnZhbHVlID0gJ3RydWUnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdsb2JhbERpc2FibGVkKGZvcmNlKSB7XG4gICAgICAgIGlmIChTZWxlY3QucGFyYW1zLmF1dG9Td2l0Y2ggfHwgZm9yY2UpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoU2VsZWN0LnBhcmFtcy5zZWxlY3QpLnZhbHVlID0gJ2ZhbHNlJztcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2dlb2tleWJvYXJkLnNlbGVjdC5qcyIsImNsYXNzIENoZWNrYm94IHtcbiAgICBjb25zdHJ1Y3RvcihwYXJlbnQsIHNlbGVjdG9ycz1udWxsLCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gICAgICAgIGlmIChzZWxlY3RvcnMpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzLnNwbGl0KCcsICcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sYXN0Rm9jdXMgPSBudWxsO1xuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgIGNoZWNrYm94OiBudWxsLFxuICAgICAgICAgICAgZm9jdXNMaXN0ZW5lck9uQ2hlY2tib3g6IHRydWUsXG4gICAgICAgICAgICBjaGVja2JveExpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgYXV0b1N3aXRjaDogdHJ1ZSxcbiAgICAgICAgfSwgb3B0cyk7XG4gICAgfVxuXG4gICAgY2hhbmdlSGFuZGxlcihlKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzZWxlY3RvciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Iocyk7XG5cbiAgICAgICAgICAgIGlmIChlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50Ll9lbmFibGUuY2FsbCh0aGlzLnBhcmVudCwgc2VsZWN0b3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5fZGlzYWJsZS5jYWxsKHRoaXMucGFyZW50LCBzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucGFyZW50Ll9mb2N1cyhkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMuc2VsZWN0b3JzKSk7XG4gICAgfVxuXG4gICAgdXBkYXRlQ2hlY2tib3goZSkge1xuICAgICAgICBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA9IGUuY3VycmVudFRhcmdldFt0aGlzLnBhcmVudC5jb25zdHJ1Y3Rvci5vcHRzXS5yZXBsYWNlT25UeXBlO1xuICAgIH1cblxuICAgIC8vIEZvciBsb2NhbCB1c2FnZVxuICAgIHJlZGVmaW5lKHNlbGVjdG9ycywgb3B0cykge1xuICAgICAgICB0aGlzLm9wdHMgPSBPYmplY3QuYXNzaWduKHRoaXMub3B0cywgb3B0cyk7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdG9ycykge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KHNlbGVjdG9ycy5zcGxpdCgnLCAnKSkpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0b3JzID0gc2VsZWN0b3JzLnNwbGl0KCcsICcpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbGlzdGVuZXJzKCkge1xuICAgICAgICBpZiAodGhpcy5vcHRzLmNoZWNrYm94ID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzY2hlbWEgPSBbXTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKChzLGkpID0+IHtcbiAgICAgICAgICAgIHNjaGVtYS5wdXNoKFtzLCBbXG4gICAgICAgICAgICAgICAgWydmb2N1c0xpc3RlbmVyT25DaGVja2JveC0nK2ksICdmb2N1cycsIGUgPT4gdGhpcy51cGRhdGVDaGVja2JveC5jYWxsKHRoaXMsIGUpXVxuICAgICAgICAgICAgXV0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBzY2hlbWEucHVzaChbdGhpcy5vcHRzLmNoZWNrYm94LCBbXG4gICAgICAgICAgICBbJ2NoZWNrYm94TGlzdGVuZXInLCAnY2hhbmdlJywgZSA9PiB0aGlzLmNoYW5nZUhhbmRsZXIuY2FsbCh0aGlzLCBlKV1cbiAgICAgICAgXV0pO1xuXG4gICAgICAgIHJldHVybiBzY2hlbWE7XG4gICAgfVxuXG4gICAgZW5hYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuam9pbignLCcpKSk7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0b1N3aXRjaCAmJiBzZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5jaGVja2JveCkuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBkaXNhYmxlZChzZWxlY3Rvcikge1xuICAgICAgICBpZiAoIXRoaXMuc2VsZWN0b3JzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5zZWxlY3RvcnMuam9pbignLCcpKSk7XG4gICAgICAgIGlmICh0aGlzLm9wdHMuYXV0b1N3aXRjaCAmJiBzZWxlY3RvcnMuaW5jbHVkZXMoc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMub3B0cy5jaGVja2JveCkuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRm9yIGdsb2JhbCB1c2FnZVxuICAgIHN0YXRpYyBidWlsZChnZW9rYiwgcGFyYW1zPXt9KSB7XG4gICAgICAgIENoZWNrYm94Lmdlb2tiID0gZ2Vva2I7XG5cbiAgICAgICAgaWYgKCFDaGVja2JveC5wYXJhbXMpIHtcbiAgICAgICAgICAgIENoZWNrYm94LnBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICBjaGVja2JveDogbnVsbCxcbiAgICAgICAgICAgICAgICBmb2N1c0xpc3RlbmVyOiB0cnVlLFxuICAgICAgICAgICAgICAgIGF1dG9Td2l0Y2g6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgQ2hlY2tib3gucGFyYW1zID0gT2JqZWN0LmFzc2lnbihDaGVja2JveC5wYXJhbXMsIHBhcmFtcyk7XG5cbiAgICAgICAgY29uc3QgZ2xvYmFsQ2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENoZWNrYm94LnBhcmFtcy5jaGVja2JveCk7XG5cbiAgICAgICAgZ2xvYmFsQ2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgICAgICAgIGdlb2tiLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gZS5jdXJyZW50VGFyZ2V0LmNoZWNrZWQgPyBnZW9rYi5fZW5hYmxlKHMpIDogZ2Vva2IuX2Rpc2FibGUocykpO1xuICAgICAgICAgICAgZ2Vva2IuX2ZvY3VzKGdlb2tiLnNlbGVjdG9ycyk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGdlb2tiLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICAgICAgcy5hZGRFdmVudExpc3RlbmVyKCdmb2N1cycsIChlKSA9PiB7XG4gICAgICAgICAgICAgICAgZS5jdXJyZW50VGFyZ2V0LmNoZWNrZWQgPSBlLnRhcmdldC5yZXBsYWNlT25UeXBlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChnZW9rYi5wYXJhbXMuZm9yY2VFbmFibGVkKSB7XG4gICAgICAgICAgICBDaGVja2JveC5nbG9iYWxFbmFibGVkKHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdsb2JhbEVuYWJsZWQoZm9yY2UpIHtcbiAgICAgICAgaWYgKENoZWNrYm94LnBhcmFtcy5hdXRvU3dpdGNoIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENoZWNrYm94LnBhcmFtcy5jaGVja2JveCkuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgZ2xvYmFsRGlzYWJsZWQoZm9yY2UpIHtcbiAgICAgICAgaWYgKENoZWNrYm94LnBhcmFtcy5hdXRvU3dpdGNoIHx8IGZvcmNlKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKENoZWNrYm94LnBhcmFtcy5jaGVja2JveCkuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IENoZWNrYm94O1xuXG5cbi8vIFdFQlBBQ0sgRk9PVEVSIC8vXG4vLyAuL3NyYy9nZW9rZXlib2FyZC5jaGVja2JveC5qcyIsImNsYXNzIExvY2FsU3RvcmFnZSB7XG4gICAgY29uc3RydWN0b3IocGFyZW50KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICAgIH1cbiAgICAvLyBGb3IgZ2xvYmFsIHVzYWdlXG4gICAgc3RhdGljIGJ1aWxkKGdlb2tiLCBwYXJhbXM9e30pIHtcbiAgICAgICAgTG9jYWxTdG9yYWdlLmdlb2tiID0gZ2Vva2I7XG5cbiAgICAgICAgTG9jYWxTdG9yYWdlLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAga2V5OiAnZ2Vva2V5Ym9hcmQnLFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIExvY2FsU3RvcmFnZS5fbG9hZC5jYWxsKExvY2FsU3RvcmFnZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdsb2JhbEVuYWJsZWQoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdlbmFibGVkJyk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuY29uc3RydWN0b3IucGFyYW1zLmtleSwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdsb2JhbERpc2FibGVkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygnZGlzYWJsZWQhISEhJyk7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHRoaXMuY29uc3RydWN0b3IucGFyYW1zLmtleSwgZmFsc2UpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfbG9hZCgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2Vva2IucGFyYW1zLmZvcmNlRW5hYmxlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3RhdGUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHRoaXMucGFyYW1zLmtleSkpO1xuXG4gICAgICAgIGlmIChzdGF0ZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5nZW9rYi5zZWxlY3RvcnMuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSA/IHRoaXMuZ2Vva2IuX2VuYWJsZShzKSA6IHRoaXMuZ2Vva2IuX2Rpc2FibGUocyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMb2NhbFN0b3JhZ2U7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2dlb2tleWJvYXJkLmxvY2Fsc3RvcmFnZS5qcyIsImNvbnN0IGluc2VydEF0Q2FyZXQgPSAoZWxlbWVudCwgY29udGVudCkgPT4ge1xuICAgIGNvbnN0IHRhZ05hbWUgPSAoZWxlbWVudC50YWdOYW1lIHx8IGVsZW1lbnQuZnJhbWVFbGVtZW50LnRhZ05hbWUpO1xuXG4gICAgaWYgKHRhZ05hbWUgPT09ICdESVYnIHx8IHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgIGxldCBzZWwsIHJhbmdlO1xuXG4gICAgICAgIGxldCB3aW5kb3dDb250ZXh0ID0gd2luZG93LCBkb2N1bWVudENvbnRleHQgPSBkb2N1bWVudDtcbiAgICAgICAgaWYgKHRhZ05hbWUgPT09ICdJRlJBTUUnKSB7XG4gICAgICAgICAgICB3aW5kb3dDb250ZXh0ID0gZWxlbWVudC53aW5kb3c7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQgPSBlbGVtZW50LmRvY3VtZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICBzZWwgPSB3aW5kb3dDb250ZXh0LmdldFNlbGVjdGlvbigpO1xuICAgICAgICAgICAgaWYgKHNlbC5nZXRSYW5nZUF0ICYmIHNlbC5yYW5nZUNvdW50KSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBzZWwuZ2V0UmFuZ2VBdCgwKTtcbiAgICAgICAgICAgICAgICByYW5nZS5kZWxldGVDb250ZW50cygpO1xuXG4gICAgICAgICAgICAgICAgbGV0IGVsID0gZG9jdW1lbnRDb250ZXh0LmNyZWF0ZUVsZW1lbnQoJ0RJVicpO1xuICAgICAgICAgICAgICAgIGVsLmlubmVySFRNTCA9IGNvbnRlbnQ7XG4gICAgICAgICAgICAgICAgbGV0IGZyYWcgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLCBub2RlLCBsYXN0Tm9kZTtcbiAgICAgICAgICAgICAgICB3aGlsZSAoKG5vZGUgPSBlbC5maXJzdENoaWxkKSkge1xuICAgICAgICAgICAgICAgICAgICBsYXN0Tm9kZSA9IGZyYWcuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJhbmdlLmluc2VydE5vZGUoZnJhZyk7XG5cbiAgICAgICAgICAgICAgICBpZiAobGFzdE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2UgPSByYW5nZS5jbG9uZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLnNldFN0YXJ0QWZ0ZXIobGFzdE5vZGUpO1xuICAgICAgICAgICAgICAgICAgICByYW5nZS5jb2xsYXBzZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICAgICAgICAgICAgICBzZWwuYWRkUmFuZ2UocmFuZ2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uICYmIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24udHlwZSAhPT0gJ0NvbnRyb2wnKSB7XG4gICAgICAgICAgICBkb2N1bWVudENvbnRleHQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCkucGFzdGVIVE1MKGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0YWdOYW1lID09PSAnSU5QVVQnIHx8IHRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgZWxlbWVudC5zZWxlY3Rpb25FbmQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICBjb25zdCBzdGFydCA9IGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQ7XG4gICAgICAgICAgICBlbGVtZW50LnZhbHVlID0gZWxlbWVudC52YWx1ZS5zbGljZSgwLCBzdGFydCkgKyBjb250ZW50ICsgZWxlbWVudC52YWx1ZS5zbGljZShlbGVtZW50LnNlbGVjdGlvbkVuZCk7XG4gICAgICAgICAgICBlbGVtZW50LnNlbGVjdGlvblN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIDE7XG4gICAgICAgICAgICBlbGVtZW50LmJsdXIoKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZm9jdXMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICBsZXQgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgIGxldCBlbmRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSAtdGV4dElucHV0UmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc3RhcnQgKz0gbm9ybWFsLnNsaWNlKDAsIHN0YXJ0KS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdFbmRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gLXRleHRJbnB1dFJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kICs9IG5vcm1hbC5zbGljZSgwLCBlbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgICAgIC8vc3RhcnQrKztcblxuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEF0Q2FyZXQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJzb3VyY2VSb290IjoiIn0=