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


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var insertAtCaret = __webpack_require__(1);

var Geokeyboard = function () {
    function Geokeyboard(selectors) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        _classCallCheck(this, Geokeyboard);

        this.selectors = [];
        this.lastFocus = null;

        this.params = Object.assign({
            hotSwitchKey: 96,
            globalHotSwitch: null,
            globalCheckbox: null,
            useLocalStorage: true
        }, params);

        this.listen(selectors, opts);

        if (this.params.useLocalStorage) {
            this._loadLocalStorage();
        }
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

                if (!selector.opts) {
                    selector.opts = {
                        replaceOnType: true,
                        hotSwitch: true,
                        onChange: null,
                        checkbox: null,
                        checkFocus: true,
                        listeners: []
                    };
                }
                selector.opts = Object.assign(selector.opts, opts);

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

                if (_this.params.globalCheckbox) {
                    var globalCheckbox = document.querySelector(_this.params.globalCheckbox);

                    if (!globalCheckbox.opts) {
                        globalCheckbox.opts = { watchCheckbox: true, listeners: [] };
                    }

                    _this.toggleListener(globalCheckbox, 'watchCheckbox', 'change', function (e) {
                        _this.constructor._watchCheckbox.call(_this, e);
                    });
                }

                if (selector.opts.checkbox) {
                    var checkbox = document.querySelector(selector.opts.checkbox);

                    if (!checkbox.opts) {
                        checkbox.opts = { watchCheckbox: true, listeners: [] };
                    }

                    _this.toggleListener(checkbox, 'watchCheckbox', 'change', function (e) {
                        _this.constructor._watchCheckbox.call(_this, e);
                    });
                }
            });

            this.selectors = Array.from(new Set(this.selectors.concat(selectors)));

            if (this.params.useLocalStorage) {
                this._loadLocalStorage();
            }

            if (callback) {
                callback.call(this, selectors);
            }

            return this;
        }
    }, {
        key: 'toggleListener',
        value: function toggleListener(selector, listener, type, fn) {
            var useCapture = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            var index = this.hasListener(selector, listener);

            if (selector.opts[listener]) {
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
            selector.opts.listeners.push(_defineProperty({}, listener, fn));
            selector.addEventListener(type, this.getListener(selector, listener));
        }
    }, {
        key: 'removeListener',
        value: function removeListener(selector, listener, type) {
            selector.removeEventListener(type, this.getListener(selector, listener));
            selector.opts.listeners.splice(this.hasListener(selector, listener), 1);
        }
    }, {
        key: 'hasListener',
        value: function hasListener(selector, listener) {
            var index = selector.opts.listeners.findIndex(function (f) {
                return typeof f[listener] === 'function';
            });
            return index === -1 ? false : index;
        }
    }, {
        key: 'getListener',
        value: function getListener(selector, listener) {
            var l = selector.opts.listeners.find(function (f) {
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
            var _this2 = this;

            var enableCheckbox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            selector = this.constructor.getContext(selector);
            selector.opts.replaceOnType = true;

            this.addListener(selector, 'replaceOnType', 'keypress', function (e) {
                _this2.constructor._replaceTyped.call(_this2, e);
            });

            if (selector.opts['onChange']) {
                selector.opts['onChange'].call(this, true);
            }

            if (selector.opts.checkbox && enableCheckbox) {
                document.querySelector(selector.opts.checkbox).checked = true;
            }

            if (this.params.globalCheckbox) {
                document.querySelector(this.params.globalCheckbox).checked = true;
            }

            if (this.params.useLocalStorage) {
                console.log('add');
                this.constructor._addToLocalStorage.call(this, true);
            }
        }
    }, {
        key: '_disable',
        value: function _disable(selector) {
            var disableCheckbox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            selector = this.constructor.getContext(selector);
            selector.opts.replaceOnType = false;

            var listener = this.getListener(selector, 'replaceOnType');
            if (!listener) {
                return;
            }

            this.removeListener(selector, 'replaceOnType', 'keypress', listener);

            if (selector.opts['onChange']) {
                selector.opts['onChange'].call(this, false);
            }

            if (selector.opts.checkbox && disableCheckbox) {
                document.querySelector(selector.opts.checkbox).checked = false;
            }

            if (this.params.globalCheckbox) {
                //?
                document.querySelector(this.params.globalCheckbox).checked = false;
            }

            if (this.params.useLocalStorage) {
                this.constructor._addToLocalStorage.call(this, false);
            }
        }
    }, {
        key: '_loadLocalStorage',
        value: function _loadLocalStorage() {
            var _this3 = this;

            var state = JSON.parse(localStorage.getItem(this.constructor.localStorageKey));

            console.log(state);

            if (state === null) {
                return;
            }

            this.selectors.forEach(function (s) {
                return state ? _this3._enable(s) : _this3._disable(s);
            });
        }
    }], [{
        key: '_replaceTyped',
        value: function _replaceTyped(e) {
            if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1) {
                //|| !this.o.active) {
                //|| !e.currentTarget.opts.active) {
                return;
            }
            e.preventDefault();

            insertAtCaret(e.currentTarget, String.fromCharCode(this.constructor.characterSet.indexOf(e.key) + 4304));
        }
    }, {
        key: '_replacePasted',
        value: function _replacePasted(e) {
            var _this4 = this;

            var content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ? window.clipboardData.getData('Text') : null;

            insertAtCaret(e.currentTarget, content.split('').map(function (c) {
                var index = _this4.constructor.characterSet.indexOf(c);
                return index !== -1 ? String.fromCharCode(index + 4304) : c;
            }).join(''));

            e.preventDefault();
        }
    }, {
        key: '_checkFocus',
        value: function _checkFocus(e) {
            if (e.currentTarget.opts.checkbox) {
                document.querySelector(e.currentTarget.opts.checkbox).checked = e.currentTarget.opts.replaceOnType;
            }

            if (this.params.globalCheckbox) {
                document.querySelector(this.params.globalCheckbox).checked = e.currentTarget.opts.replaceOnType;
            }

            this.lastFocus = e.currentTarget;
        }
    }, {
        key: '_watchCheckbox',
        value: function _watchCheckbox(e) {
            var _this5 = this;

            var selectors = document.querySelector(this.params.globalCheckbox) === e.currentTarget ? this.selectors : this.selectors.filter(function (selector) {
                selector = _this5.constructor.getContext(selector);
                return document.querySelector(selector.opts.checkbox) === e.currentTarget;
            });

            selectors.forEach(function (s) {
                e.currentTarget.checked ? _this5._enable(s) : _this5._disable(s);
            });

            if (this.lastFocus && selectors.includes(this.lastFocus.frameElement || this.lastFocus)) {
                this.lastFocus.focus();
            } else {
                this.constructor.getContext(selectors[0]).focus();
            }
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
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this6._disable(s, s === selector);
                    });
                    this.params.globalHotSwitch.call(this, false);
                } else {
                    this._disable(selector);
                }
            } else {
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this6._enable(s, s === selector);
                    });
                    this.params.globalHotSwitch.call(this, true);
                } else {
                    this._enable(selector);
                }
            }
        }
    }, {
        key: '_addToLocalStorage',
        value: function _addToLocalStorage(state) {
            console.log('##' + state);
            localStorage.setItem(this.constructor.localStorageKey, state);
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
            return selector.tagName.toLowerCase() === 'iframe' ? (selector.contentWindow || selector.contentDocument).window : selector;
        }
    }, {
        key: 'characterSet',
        get: function get() {
            return 'abgdevzTiklmnopJrstufqRySCcZwWxjh'.split('');
        }
    }, {
        key: 'localStorageKey',
        get: function get() {
            return 'geokeyboard';
        }

        // Not implemented

    }, {
        key: 'propertyName',
        get: function get() {
            return this.constructor.name;
        }
    }]);

    return Geokeyboard;
}();

window.Geokeyboard = Geokeyboard;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var insertAtCaret = function insertAtCaret(element, content) {

    var tagName = (element.tagName || element.frameElement.tagName).toLowerCase();

    if (tagName === 'div' || tagName === 'iframe') {
        var sel = void 0,
            range = void 0;

        var windowContext = window,
            documentContext = document;
        if (tagName === 'iframe') {
            windowContext = element.window;
            documentContext = element.document;
        }

        if (windowContext.getSelection) {
            sel = windowContext.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                var el = documentContext.createElement('div');
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
    } else if (tagName === 'input' || tagName === 'textarea') {
        if (typeof element.selectionStart === 'number' && typeof element.selectionEnd === 'number') {
            var start = element.selectionStart;
            element.value = element.value.slice(0, start) + content + element.value.slice(element.selectionEnd);
            element.selectionStart = element.selectionEnd = start + 1;
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