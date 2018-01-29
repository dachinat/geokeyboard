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


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var insertAtCaret = __webpack_require__(2);

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
/* 2 */
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgOGQ1MjFmMDQ5YzdiNGY5MTk4MTciLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6WyJpbnNlcnRBdENhcmV0IiwicmVxdWlyZSIsIkdlb2tleWJvYXJkIiwic2VsZWN0b3JzIiwicGFyYW1zIiwib3B0cyIsImxhc3RGb2N1cyIsIk9iamVjdCIsImFzc2lnbiIsImhvdFN3aXRjaEtleSIsImdsb2JhbEhvdFN3aXRjaCIsImdsb2JhbENoZWNrYm94IiwidXNlTG9jYWxTdG9yYWdlIiwibGlzdGVuIiwiX2xvYWRMb2NhbFN0b3JhZ2UiLCJjYWxsYmFjayIsImNvbnN0cnVjdG9yIiwiX3dhcm5CYWRTZWxlY3RvciIsIkFycmF5IiwiZnJvbSIsImRvY3VtZW50IiwicXVlcnlTZWxlY3RvckFsbCIsImZvckVhY2giLCJzZWxlY3RvciIsImdldENvbnRleHQiLCJyZXBsYWNlT25UeXBlIiwiaG90U3dpdGNoIiwib25DaGFuZ2UiLCJjaGVja2JveCIsImNoZWNrRm9jdXMiLCJsaXN0ZW5lcnMiLCJ0b2dnbGVMaXN0ZW5lciIsIl9yZXBsYWNlVHlwZWQiLCJjYWxsIiwiZSIsIl9yZXBsYWNlUGFzdGVkIiwiX2hvdFN3aXRjaCIsIl9jaGVja0ZvY3VzIiwicXVlcnlTZWxlY3RvciIsIndhdGNoQ2hlY2tib3giLCJfd2F0Y2hDaGVja2JveCIsIlNldCIsImNvbmNhdCIsImxpc3RlbmVyIiwidHlwZSIsImZuIiwidXNlQ2FwdHVyZSIsImluZGV4IiwiaGFzTGlzdGVuZXIiLCJhZGRMaXN0ZW5lciIsInJlbW92ZUxpc3RlbmVyIiwicHVzaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJnZXRMaXN0ZW5lciIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJzcGxpY2UiLCJmaW5kSW5kZXgiLCJmIiwibCIsImZpbmQiLCJ1bmRlZmluZWQiLCJlbmFibGVDaGVja2JveCIsImNoZWNrZWQiLCJjb25zb2xlIiwibG9nIiwiX2FkZFRvTG9jYWxTdG9yYWdlIiwiZGlzYWJsZUNoZWNrYm94Iiwic3RhdGUiLCJKU09OIiwicGFyc2UiLCJsb2NhbFN0b3JhZ2UiLCJnZXRJdGVtIiwibG9jYWxTdG9yYWdlS2V5IiwiX2VuYWJsZSIsInMiLCJfZGlzYWJsZSIsIlJlZ0V4cCIsImNoYXJhY3RlclNldCIsImpvaW4iLCJ0ZXN0Iiwia2V5IiwibGVuZ3RoIiwicHJldmVudERlZmF1bHQiLCJjdXJyZW50VGFyZ2V0IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaW5kZXhPZiIsImNvbnRlbnQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsIndpbmRvdyIsInNwbGl0IiwibWFwIiwiYyIsImZpbHRlciIsImluY2x1ZGVzIiwiZnJhbWVFbGVtZW50IiwiZm9jdXMiLCJrZXlDb2RlIiwid2hpY2giLCJfdG9nZ2xlIiwic2V0SXRlbSIsIndhcm4iLCJuYW1lIiwidGFnTmFtZSIsInRvTG93ZXJDYXNlIiwiY29udGVudFdpbmRvdyIsImNvbnRlbnREb2N1bWVudCIsImVsZW1lbnQiLCJzZWwiLCJyYW5nZSIsIndpbmRvd0NvbnRleHQiLCJkb2N1bWVudENvbnRleHQiLCJnZXRTZWxlY3Rpb24iLCJnZXRSYW5nZUF0IiwicmFuZ2VDb3VudCIsImRlbGV0ZUNvbnRlbnRzIiwiZWwiLCJjcmVhdGVFbGVtZW50IiwiaW5uZXJIVE1MIiwiZnJhZyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJub2RlIiwibGFzdE5vZGUiLCJmaXJzdENoaWxkIiwiYXBwZW5kQ2hpbGQiLCJpbnNlcnROb2RlIiwiY2xvbmVSYW5nZSIsInNldFN0YXJ0QWZ0ZXIiLCJjb2xsYXBzZSIsInJlbW92ZUFsbFJhbmdlcyIsImFkZFJhbmdlIiwic2VsZWN0aW9uIiwiY3JlYXRlUmFuZ2UiLCJwYXN0ZUhUTUwiLCJzZWxlY3Rpb25TdGFydCIsInNlbGVjdGlvbkVuZCIsInN0YXJ0IiwidmFsdWUiLCJzbGljZSIsIm5vcm1hbCIsInJlcGxhY2UiLCJ0ZXh0SW5wdXRSYW5nZSIsImNyZWF0ZVRleHRSYW5nZSIsIm1vdmVUb0Jvb2ttYXJrIiwiZ2V0Qm9va21hcmsiLCJlbmRSYW5nZSIsImVuZCIsImNvbXBhcmVFbmRQb2ludHMiLCJjaGFyTGVuZ3RoIiwibW92ZVN0YXJ0IiwibW92ZUVuZCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsbUNBQTJCLDBCQUEwQixFQUFFO0FBQ3ZELHlDQUFpQyxlQUFlO0FBQ2hEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhEQUFzRCwrREFBK0Q7O0FBRXJIO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3REEsSUFBTUEsZ0JBQWdCLG1CQUFBQyxDQUFRLENBQVIsQ0FBdEI7O0lBRU1DLFc7QUFDRix5QkFBWUMsU0FBWixFQUEyQztBQUFBLFlBQXBCQyxNQUFvQix1RUFBYixFQUFhO0FBQUEsWUFBVEMsSUFBUyx1RUFBSixFQUFJOztBQUFBOztBQUN2QyxhQUFLRixTQUFMLEdBQWlCLEVBQWpCO0FBQ0EsYUFBS0csU0FBTCxHQUFpQixJQUFqQjs7QUFFQSxhQUFLRixNQUFMLEdBQWNHLE9BQU9DLE1BQVAsQ0FBYztBQUN4QkMsMEJBQWMsRUFEVTtBQUV4QkMsNkJBQWlCLElBRk87QUFHeEJDLDRCQUFnQixJQUhRO0FBSXhCQyw2QkFBaUI7QUFKTyxTQUFkLEVBS1hSLE1BTFcsQ0FBZDs7QUFPQSxhQUFLUyxNQUFMLENBQVlWLFNBQVosRUFBdUJFLElBQXZCOztB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LE9BQVAsR0FBaUJ6SixhQUFqQixDIiwiZmlsZSI6Imdlb2tleWJvYXJkLmRldi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIDhkNTIxZjA0OWM3YjRmOTE5ODE3IiwiY29uc3QgaW5zZXJ0QXRDYXJldCA9IHJlcXVpcmUoXCIuL2luc2VydC1hdC1jYXJldFwiKTtcblxuY2xhc3MgR2Vva2V5Ym9hcmQge1xuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9ycywgcGFyYW1zPXt9LCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzID0gW107XG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gbnVsbDtcblxuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaG90U3dpdGNoS2V5OiA5NixcbiAgICAgICAgICAgIGdsb2JhbEhvdFN3aXRjaDogbnVsbCxcbiAgICAgICAgICAgIGdsb2JhbENoZWNrYm94OiBudWxsLFxuICAgICAgICAgICAgdXNlTG9jYWxTdG9yYWdlOiB0cnVlXG4gICAgICAgIH0sIHBhcmFtcyk7XG5cbiAgICAgICAgdGhpcy5saXN0ZW4oc2VsZWN0b3JzLCBvcHRzKTtcblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMudXNlTG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkTG9jYWxTdG9yYWdlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsaXN0ZW4oc2VsZWN0b3JzLCBvcHRzPXt9LCBjYWxsYmFjaz1udWxsKSB7XG4gICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3dhcm5CYWRTZWxlY3RvcihzZWxlY3RvcnMpO1xuXG4gICAgICAgIHNlbGVjdG9ycyA9IEFycmF5LmZyb20oZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcnMpKTtcblxuICAgICAgICBzZWxlY3RvcnMuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG5cbiAgICAgICAgICAgIGlmICghc2VsZWN0b3Iub3B0cykge1xuICAgICAgICAgICAgICAgIHNlbGVjdG9yLm9wdHMgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJlcGxhY2VPblR5cGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIGhvdFN3aXRjaDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94OiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjaGVja0ZvY3VzOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBsaXN0ZW5lcnM6IFtdLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZWxlY3Rvci5vcHRzID0gT2JqZWN0LmFzc2lnbihzZWxlY3Rvci5vcHRzLCBvcHRzKTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25QYXN0ZScsICdwYXN0ZScsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VQYXN0ZWQuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAnaG90U3dpdGNoJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5faG90U3dpdGNoLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ2NoZWNrRm9jdXMnLCAnZm9jdXMnLCBlID0+IHtcbiAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX2NoZWNrRm9jdXMuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBnbG9iYWxDaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFnbG9iYWxDaGVja2JveC5vcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbENoZWNrYm94Lm9wdHMgPSB7IHdhdGNoQ2hlY2tib3g6IHRydWUsIGxpc3RlbmVyczogW10sIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihnbG9iYWxDaGVja2JveCwgJ3dhdGNoQ2hlY2tib3gnLCAnY2hhbmdlJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3dhdGNoQ2hlY2tib3guY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHNlbGVjdG9yLm9wdHMuY2hlY2tib3gpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjaGVja2JveCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3Iub3B0cy5jaGVja2JveCk7XG5cbiAgICAgICAgICAgICAgICBpZiAoIWNoZWNrYm94Lm9wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tib3gub3B0cyA9IHsgd2F0Y2hDaGVja2JveDogdHJ1ZSwgbGlzdGVuZXJzOiBbXSwgfTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKGNoZWNrYm94LCAnd2F0Y2hDaGVja2JveCcsICdjaGFuZ2UnLCBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fd2F0Y2hDaGVja2JveC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnNlbGVjdG9ycyA9IEFycmF5LmZyb20obmV3IFNldCh0aGlzLnNlbGVjdG9ycy5jb25jYXQoc2VsZWN0b3JzKSkpO1xuXG4gICAgICAgIGlmICh0aGlzLnBhcmFtcy51c2VMb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRMb2NhbFN0b3JhZ2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzLCBzZWxlY3RvcnMpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG5cbiAgICB0b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuLCB1c2VDYXB0dXJlPWZhbHNlKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpO1xuXG4gICAgICAgIGlmIChzZWxlY3Rvci5vcHRzW2xpc3RlbmVyXSkge1xuICAgICAgICAgICAgaWYgKGluZGV4ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgdXNlQ2FwdHVyZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIGZuKSB7XG4gICAgICAgIHNlbGVjdG9yLm9wdHMubGlzdGVuZXJzLnB1c2goe1tsaXN0ZW5lcl06IGZufSk7XG4gICAgICAgIHNlbGVjdG9yLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICB9XG5cbiAgICByZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUpIHtcbiAgICAgICAgc2VsZWN0b3IucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikpO1xuICAgICAgICBzZWxlY3Rvci5vcHRzLmxpc3RlbmVycy5zcGxpY2UodGhpcy5oYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpLCAxKTtcbiAgICB9XG5cbiAgICBoYXNMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBzZWxlY3Rvci5vcHRzLmxpc3RlbmVycy5maW5kSW5kZXgoZiA9PiB0eXBlb2YgZltsaXN0ZW5lcl0gPT09ICdmdW5jdGlvbicpO1xuICAgICAgICByZXR1cm4gaW5kZXggPT09IC0xID8gZmFsc2UgOiBpbmRleDtcbiAgICB9XG5cblxuICAgIGdldExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lcikge1xuICAgICAgICBjb25zdCBsID0gc2VsZWN0b3Iub3B0cy5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKTtcbiAgICAgICAgaWYgKCFsKSB7XG4gICAgICAgICAgICAvL2NvbnNvbGUud2FybihgTm8gc3VjaCBsaXN0ZW5lciBhcyAnJHtsaXN0ZW5lcn0nIGZvciAnJHtzZWxlY3Rvci5vdXRlckhUTUx9J2ApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsID8gbFtsaXN0ZW5lcl0gOiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgX2VuYWJsZShzZWxlY3RvciwgZW5hYmxlQ2hlY2tib3g9dHJ1ZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yLm9wdHMucmVwbGFjZU9uVHlwZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXSkge1xuICAgICAgICAgICAgc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXS5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yLm9wdHMuY2hlY2tib3ggJiYgZW5hYmxlQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3Iub3B0cy5jaGVja2JveCkuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLnVzZUxvY2FsU3RvcmFnZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2FkZCcpO1xuICAgICAgICAgICAgdGhpcy5jb25zdHJ1Y3Rvci5fYWRkVG9Mb2NhbFN0b3JhZ2UuY2FsbCh0aGlzLCB0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9kaXNhYmxlKHNlbGVjdG9yLCBkaXNhYmxlQ2hlY2tib3g9dHJ1ZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yLm9wdHMucmVwbGFjZU9uVHlwZSA9IGZhbHNlO1xuXG4gICAgICAgIGNvbnN0IGxpc3RlbmVyID0gdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnKTtcbiAgICAgICAgaWYgKCFsaXN0ZW5lcikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBsaXN0ZW5lcik7XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yLm9wdHNbJ29uQ2hhbmdlJ10pIHtcbiAgICAgICAgICAgIHNlbGVjdG9yLm9wdHNbJ29uQ2hhbmdlJ10uY2FsbCh0aGlzLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2VsZWN0b3Iub3B0cy5jaGVja2JveCAmJiBkaXNhYmxlQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3Iub3B0cy5jaGVja2JveCkuY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSB7Ly8/XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMudXNlTG9jYWxTdG9yYWdlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9hZGRUb0xvY2FsU3RvcmFnZS5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9sb2FkTG9jYWxTdG9yYWdlKCkge1xuICAgICAgICBjb25zdCBzdGF0ZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0odGhpcy5jb25zdHJ1Y3Rvci5sb2NhbFN0b3JhZ2VLZXkpKTtcblxuICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZSk7XG5cbiAgICAgICAgaWYgKHN0YXRlID09PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlID8gdGhpcy5fZW5hYmxlKHMpIDogdGhpcy5fZGlzYWJsZShzKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlVHlwZWQoZSkge1xuICAgICAgICBpZiAoIW5ldyBSZWdFeHAodGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuam9pbignfCcpKS50ZXN0KGUua2V5KSB8fCBlLmtleS5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAvL3x8ICF0aGlzLm8uYWN0aXZlKSB7XG4gICAgICAgICAgICAvL3x8ICFlLmN1cnJlbnRUYXJnZXQub3B0cy5hY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihlLmtleSkgKyA0MzA0KSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlUGFzdGVkKGUpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBlLmNsaXBib2FyZERhdGEgPyBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpIDogd2luZG93LmNsaXBib2FyZERhdGEgP1xuICAgICAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGEuZ2V0RGF0YSgnVGV4dCcpIDogbnVsbDtcblxuICAgICAgICBpbnNlcnRBdENhcmV0KGUuY3VycmVudFRhcmdldCwgY29udGVudC5zcGxpdCgnJylcbiAgICAgICAgICAgIC5tYXAoYyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggIT09IC0xID8gU3RyaW5nLmZyb21DaGFyQ29kZShpbmRleCArIDQzMDQpIDogYztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignJykpO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2NoZWNrRm9jdXMoZSkge1xuICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0Lm9wdHMuY2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZS5jdXJyZW50VGFyZ2V0Lm9wdHMuY2hlY2tib3gpLmNoZWNrZWQgPSBlLmN1cnJlbnRUYXJnZXQub3B0cy5yZXBsYWNlT25UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KS5jaGVja2VkID0gZS5jdXJyZW50VGFyZ2V0Lm9wdHMucmVwbGFjZU9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgIH1cblxuICAgIHN0YXRpYyBfd2F0Y2hDaGVja2JveChlKSB7XG4gICAgICAgIGxldCBzZWxlY3RvcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSA9PT0gZS5jdXJyZW50VGFyZ2V0ID8gdGhpcy5zZWxlY3RvcnMgOlxuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZmlsdGVyKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yLm9wdHMuY2hlY2tib3gpID09PSBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA/IHRoaXMuX2VuYWJsZShzKSA6IHRoaXMuX2Rpc2FibGUocyk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgaWYgKHRoaXMubGFzdEZvY3VzICYmIHNlbGVjdG9ycy5pbmNsdWRlcyh0aGlzLmxhc3RGb2N1cy5mcmFtZUVsZW1lbnQgfHwgdGhpcy5sYXN0Rm9jdXMpKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1cy5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3JzWzBdKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF9ob3RTd2l0Y2goZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0aGlzLnBhcmFtcy5ob3RTd2l0Y2hLZXkgfHwgZS53aGljaCA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl90b2dnbGUuY2FsbCh0aGlzLCBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF90b2dnbGUoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhhc0xpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZGlzYWJsZShzLCBzID09PSBzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZW5hYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZShzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX2FkZFRvTG9jYWxTdG9yYWdlKHN0YXRlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCcjIycrc3RhdGUpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLmNvbnN0cnVjdG9yLmxvY2FsU3RvcmFnZUtleSwgc3RhdGUpO1xuICAgIH1cblxuICAgIHN0YXRpYyBfd2FybkJhZFNlbGVjdG9yKHNlbGVjdG9ycykge1xuICAgICAgICBzZWxlY3RvcnMuc3BsaXQoJywgJykuZm9yRWFjaChzZWxlY3RvciA9PiB7XG4gICAgICAgICAgICBpZiAoIWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZVxuICAgICAgICAgICAgICAgICAgICAud2FybihgJHt0aGlzLmNvbnN0cnVjdG9yLm5hbWV9OiBBbiBlbGVtZW50IHdpdGggaWRlbnRpZmllciAnJHtzZWxlY3Rvcn0nIG5vdCBmb3VuZC4gKFNraXBwaW5nLi4uKWApO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0IGNoYXJhY3RlclNldCgpIHtcbiAgICAgICAgcmV0dXJuICdhYmdkZXZ6VGlrbG1ub3BKcnN0dWZxUnlTQ2Nad1d4amgnLnNwbGl0KCcnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0Q29udGV4dChzZWxlY3Rvcikge1xuICAgICAgICByZXR1cm4gKHNlbGVjdG9yLnRhZ05hbWUudG9Mb3dlckNhc2UoKSA9PT0gJ2lmcmFtZScpID9cbiAgICAgICAgICAgIChzZWxlY3Rvci5jb250ZW50V2luZG93IHx8IHNlbGVjdG9yLmNvbnRlbnREb2N1bWVudCkud2luZG93IDogc2VsZWN0b3I7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBsb2NhbFN0b3JhZ2VLZXkoKSB7XG4gICAgICAgIHJldHVybiAnZ2Vva2V5Ym9hcmQnO1xuICAgIH1cblxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZFxuICAgIHN0YXRpYyBnZXQgcHJvcGVydHlOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbn1cblxud2luZG93Lkdlb2tleWJvYXJkID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21haW4uanMiLCJjb25zdCBpbnNlcnRBdENhcmV0ID0gKGVsZW1lbnQsIGNvbnRlbnQpID0+IHtcblxuICAgIGNvbnN0IHRhZ05hbWUgPSAoZWxlbWVudC50YWdOYW1lIHx8IGVsZW1lbnQuZnJhbWVFbGVtZW50LnRhZ05hbWUpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ2RpdicgfHwgdGFnTmFtZSA9PT0gJ2lmcmFtZScpIHtcbiAgICAgICAgbGV0IHNlbCwgcmFuZ2U7XG5cbiAgICAgICAgbGV0IHdpbmRvd0NvbnRleHQgPSB3aW5kb3csIGRvY3VtZW50Q29udGV4dCA9IGRvY3VtZW50O1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2lmcmFtZScpIHtcbiAgICAgICAgICAgIHdpbmRvd0NvbnRleHQgPSBlbGVtZW50LndpbmRvdztcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dCA9IGVsZW1lbnQuZG9jdW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93Q29udGV4dC5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbCA9IHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICAgICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgICAgICAgICAgICBsZXQgZnJhZyA9IGRvY3VtZW50Q29udGV4dC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIG5vZGUsIGxhc3ROb2RlO1xuICAgICAgICAgICAgICAgIHdoaWxlICgobm9kZSA9IGVsLmZpcnN0Q2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3ROb2RlID0gZnJhZy5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShmcmFnKTtcblxuICAgICAgICAgICAgICAgIGlmIChsYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihsYXN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbC5hZGRSYW5nZShyYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24gJiYgZG9jdW1lbnRDb250ZXh0LnNlbGVjdGlvbi50eXBlICE9PSAnQ29udHJvbCcpIHtcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5wYXN0ZUhUTUwoY29udGVudCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICdpbnB1dCcgfHwgdGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvbkVuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBlbGVtZW50LnZhbHVlLnNsaWNlKDAsIHN0YXJ0KSArIGNvbnRlbnQgKyBlbGVtZW50LnZhbHVlLnNsaWNlKGVsZW1lbnQuc2VsZWN0aW9uRW5kKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICBsZXQgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgIGxldCBlbmRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSAtdGV4dElucHV0UmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc3RhcnQgKz0gbm9ybWFsLnNsaWNlKDAsIHN0YXJ0KS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdFbmRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gLXRleHRJbnB1dFJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kICs9IG5vcm1hbC5zbGljZSgwLCBlbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgICAgIC8vc3RhcnQrKztcblxuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEF0Q2FyZXQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJzb3VyY2VSb290IjoiIn0=