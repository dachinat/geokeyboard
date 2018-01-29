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
            globalCheckbox: null
        }, params);

        this.listen(selectors, opts);
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
            try {
                return selector.opts.listeners.find(function (f) {
                    return f[listener];
                })[listener];
            } catch (e) {
                console.warn('There is no such listener as \'' + listener + '\' for \'' + selector.outerHTML + '\'...');
            }
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
        }
    }, {
        key: '_disable',
        value: function _disable(selector) {
            var disableCheckbox = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

            selector = this.constructor.getContext(selector);
            selector.opts.replaceOnType = false;

            this.removeListener(selector, 'replaceOnType', 'keypress', this.getListener(selector, 'replaceOnType'));

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
        }
    }], [{
        key: '_replaceTyped',
        value: function _replaceTyped(e) {
            if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1) {
                //|| !this.o.active) {
                //|| !e.currentTarget.opts.active) {
                return;
            }
            console.log('return');
            e.preventDefault();

            insertAtCaret(e.currentTarget, String.fromCharCode(this.constructor.characterSet.indexOf(e.key) + 4304));
        }
    }, {
        key: '_replacePasted',
        value: function _replacePasted(e) {
            var _this3 = this;

            var content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ? window.clipboardData.getData('Text') : null;

            insertAtCaret(e.currentTarget, content.split('').map(function (c) {
                var index = _this3.constructor.characterSet.indexOf(c);
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
            var _this4 = this;

            var selectors = document.querySelector(this.params.globalCheckbox) === e.currentTarget ? this.selectors : this.selectors.filter(function (selector) {
                selector = _this4.constructor.getContext(selector);
                return document.querySelector(selector.opts.checkbox) === e.currentTarget;
            });

            selectors.forEach(function (s) {
                e.currentTarget.checked ? _this4._enable(s) : _this4._disable(s);
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
            var _this5 = this;

            var index = this.hasListener(selector, 'replaceOnType');

            if (index !== false) {
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this5._disable(s, s === selector);
                    });
                    this.params.globalHotSwitch.call(this, false);
                } else {
                    this._disable(selector);
                }
            } else {
                if (typeof this.params.globalHotSwitch === 'function') {
                    this.selectors.forEach(function (s) {
                        return _this5._enable(s, s === selector);
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
            var _this6 = this;

            selectors.split(', ').forEach(function (selector) {
                if (!document.querySelector(selector)) {
                    console.warn(_this6.constructor.name + ': An element with identifier \'' + selector + '\' not found. (Skipping...)');
                    return true;
                }
            });
        }
    }, {
        key: 'getContext',
        value: function getContext(selector) {
            return selector.tagName.toLowerCase() === 'iframe' ? (selector.contentWindow || selector.contentDocument).window : selector;
        }

        // Not implemented

    }, {
        key: 'characterSet',
        get: function get() {
            return 'abgdevzTiklmnopJrstufqRySCcZwWxjh'.split('');
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZDNjZDFiZmI1YmY2NTJmMTE0YWQiLCJ3ZWJwYWNrOi8vLy4vc3JjL21haW4uanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJuYW1lcyI6WyJpbnNlcnRBdENhcmV0IiwicmVxdWlyZSIsIkdlb2tleWJvYXJkIiwic2VsZWN0b3JzIiwicGFyYW1zIiwib3B0cyIsImxhc3RGb2N1cyIsIk9iamVjdCIsImFzc2lnbiIsImhvdFN3aXRjaEtleSIsImdsb2JhbEhvdFN3aXRjaCIsImdsb2JhbENoZWNrYm94IiwibGlzdGVuIiwiY2FsbGJhY2siLCJjb25zdHJ1Y3RvciIsIl93YXJuQmFkU2VsZWN0b3IiLCJBcnJheSIsImZyb20iLCJkb2N1bWVudCIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJmb3JFYWNoIiwic2VsZWN0b3IiLCJnZXRDb250ZXh0IiwicmVwbGFjZU9uVHlwZSIsImhvdFN3aXRjaCIsIm9uQ2hhbmdlIiwiY2hlY2tib3giLCJjaGVja0ZvY3VzIiwibGlzdGVuZXJzIiwidG9nZ2xlTGlzdGVuZXIiLCJfcmVwbGFjZVR5cGVkIiwiY2FsbCIsImUiLCJfcmVwbGFjZVBhc3RlZCIsIl9ob3RTd2l0Y2giLCJfY2hlY2tGb2N1cyIsInF1ZXJ5U2VsZWN0b3IiLCJ3YXRjaENoZWNrYm94IiwiX3dhdGNoQ2hlY2tib3giLCJTZXQiLCJjb25jYXQiLCJsaXN0ZW5lciIsInR5cGUiLCJmbiIsInVzZUNhcHR1cmUiLCJpbmRleCIsImhhc0xpc3RlbmVyIiwiYWRkTGlzdGVuZXIiLCJyZW1vdmVMaXN0ZW5lciIsInB1c2giLCJhZGRFdmVudExpc3RlbmVyIiwiZ2V0TGlzdGVuZXIiLCJyZW1vdmVFdmVudExpc3RlbmVyIiwic3BsaWNlIiwiZmluZEluZGV4IiwiZiIsImZpbmQiLCJjb25zb2xlIiwid2FybiIsIm91dGVySFRNTCIsImVuYWJsZUNoZWNrYm94IiwiY2hlY2tlZCIsImRpc2FibGVDaGVja2JveCIsIlJlZ0V4cCIsImNoYXJhY3RlclNldCIsImpvaW4iLCJ0ZXN0Iiwia2V5IiwibGVuZ3RoIiwibG9nIiwicHJldmVudERlZmF1bHQiLCJjdXJyZW50VGFyZ2V0IiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwiaW5kZXhPZiIsImNvbnRlbnQiLCJjbGlwYm9hcmREYXRhIiwiZ2V0RGF0YSIsIndpbmRvdyIsInNwbGl0IiwibWFwIiwiYyIsImZpbHRlciIsIl9lbmFibGUiLCJzIiwiX2Rpc2FibGUiLCJpbmNsdWRlcyIsImZyYW1lRWxlbWVudCIsImZvY3VzIiwia2V5Q29kZSIsIndoaWNoIiwiX3RvZ2dsZSIsIm5hbWUiLCJ0YWdOYW1lIiwidG9Mb3dlckNhc2UiLCJjb250ZW50V2luZG93IiwiY29udGVudERvY3VtZW50IiwiZWxlbWVudCIsInNlbCIsInJhbmdlIiwid2luZG93Q29udGV4dCIsImRvY3VtZW50Q29udGV4dCIsImdldFNlbGVjdGlvbiIsImdldFJhbmdlQXQiLCJyYW5nZUNvdW50IiwiZGVsZXRlQ29udGVudHMiLCJlbCIsImNyZWF0ZUVsZW1lbnQiLCJpbm5lckhUTUwiLCJmcmFnIiwiY3JlYXRlRG9jdW1lbnRGcmFnbWVudCIsIm5vZGUiLCJsYXN0Tm9kZSIsImZpcnN0Q2hpbGQiLCJhcHBlbmRDaGlsZCIsImluc2VydE5vZGUiLCJjbG9uZVJhbmdlIiwic2V0U3RhcnRBZnRlciIsImNvbGxhcHNlIiwicmVtb3ZlQWxsUmFuZ2VzIiwiYWRkUmFuZ2UiLCJzZWxlY3Rpb24iLCJjcmVhdGVSYW5nZSIsInBhc3RlSFRNTCIsInNlbGVjdGlvblN0YXJ0Iiwic2VsZWN0aW9uRW5kIiwic3RhcnQiLCJ2YWx1ZSIsInNsaWNlIiwibm9ybWFsIiwicmVwbGFjZSIsInRleHRJbnB1dFJhbmdlIiwiY3JlYXRlVGV4dFJhbmdlIiwibW92ZVRvQm9va21hcmsiLCJnZXRCb29rbWFyayIsImVuZFJhbmdlIiwiZW5kIiwiY29tcGFyZUVuZFBvaW50cyIsImNoYXJMZW5ndGgi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LFlBQWhDLEVBQThDRixRQUE5QyxJQUEwRCxDQUFDLENBQS9ELEVBQWtFO0FBQzlEVCx5QkFBUVUsTUFBTUUsVUFBZDtBQUNILGFBRkQsTUFFTztBQUNIWix5QkFBUSxDQUFDSyxlQUFlUSxTQUFmLENBQXlCLFdBQXpCLEVBQXNDLENBQUNELFVBQXZDLENBQVQ7QUFDQVosMEJBQVNHLE9BQU9ELEtBQVAsQ0FBYSxDQUFiLEVBQWdCRixNQUFoQixFQUF1Qi9DLEtBQXZCLENBQTZCLElBQTdCLEVBQW1DWCxNQUFuQyxHQUE0QyxDQUFyRDs7QUFFQSxvQkFBSStELGVBQWVNLGdCQUFmLENBQWdDLFVBQWhDLEVBQTRDRixRQUE1QyxJQUF3RCxDQUFDLENBQTdELEVBQWdFO0FBQzVEQywwQkFBTUUsVUFBTjtBQUNILGlCQUZELE1BRU87QUFDSEYsMEJBQU0sQ0FBQ0wsZUFBZVMsT0FBZixDQUF1QixXQUF2QixFQUFvQyxDQUFDRixVQUFyQyxDQUFQO0FBQ0FGLDJCQUFPUCxPQUFPRCxLQUFQLENBQWEsQ0FBYixFQUFnQlEsR0FBaEIsRUFBcUJ6RCxLQUFyQixDQUEyQixJQUEzQixFQUFpQ1gsTUFBakMsR0FBMEMsQ0FBakQ7QUFDSDtBQUNKOztBQUVENkIsb0JBQVE4QixLQUFSLEdBQWdCOUIsUUFBUThCLEtBQVIsQ0FBY0MsS0FBZCxDQUFvQixDQUFwQixFQUF1QkYsTUFBdkIsSUFBZ0NuRCxPQUFoQyxHQUEwQ3NCLFFBQVE4QixLQUFSLENBQWNDLEtBQWQsQ0FBb0JRLEdBQXBCLENBQTFEO0FBQ0E7O0FBRUFMLDZCQUFpQmxDLFFBQVFtQyxlQUFSLEVBQWpCO0FBQ0FELDJCQUFlYixRQUFmLENBQXdCLElBQXhCO0FBQ0g7QUFDSjtBQUNKLENBM0VEOztBQTZFQXVCLE9BQU9DLE9BQVAsR0FBaUI5SSxhQUFqQixDIiwiZmlsZSI6Imdlb2tleWJvYXJkLmRldi5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwge1xuIFx0XHRcdFx0Y29uZmlndXJhYmxlOiBmYWxzZSxcbiBcdFx0XHRcdGVudW1lcmFibGU6IHRydWUsXG4gXHRcdFx0XHRnZXQ6IGdldHRlclxuIFx0XHRcdH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IDApO1xuXG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIHdlYnBhY2svYm9vdHN0cmFwIGQzY2QxYmZiNWJmNjUyZjExNGFkIiwiY29uc3QgaW5zZXJ0QXRDYXJldCA9IHJlcXVpcmUoXCIuL2luc2VydC1hdC1jYXJldFwiKTtcblxuY2xhc3MgR2Vva2V5Ym9hcmQge1xuICAgIGNvbnN0cnVjdG9yKHNlbGVjdG9ycywgcGFyYW1zPXt9LCBvcHRzPXt9KSB7XG4gICAgICAgIHRoaXMuc2VsZWN0b3JzID0gW107XG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gbnVsbDtcblxuICAgICAgICB0aGlzLnBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe1xuICAgICAgICAgICAgaG90U3dpdGNoS2V5OiA5NixcbiAgICAgICAgICAgIGdsb2JhbEhvdFN3aXRjaDogbnVsbCxcbiAgICAgICAgICAgIGdsb2JhbENoZWNrYm94OiBudWxsLFxuICAgICAgICB9LCBwYXJhbXMpO1xuXG4gICAgICAgIHRoaXMubGlzdGVuKHNlbGVjdG9ycywgb3B0cyk7XG4gICAgfVxuXG4gICAgbGlzdGVuKHNlbGVjdG9ycywgb3B0cz17fSwgY2FsbGJhY2s9bnVsbCkge1xuICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl93YXJuQmFkU2VsZWN0b3Ioc2VsZWN0b3JzKTtcblxuICAgICAgICBzZWxlY3RvcnMgPSBBcnJheS5mcm9tKGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3JzKSk7XG5cbiAgICAgICAgc2VsZWN0b3JzLmZvckVhY2goc2VsZWN0b3IgPT4ge1xuICAgICAgICAgICAgc2VsZWN0b3IgPSB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3IpO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yLm9wdHMpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rvci5vcHRzID0ge1xuICAgICAgICAgICAgICAgICAgICByZXBsYWNlT25UeXBlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBob3RTd2l0Y2g6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICBjaGVja2JveDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgY2hlY2tGb2N1czogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgbGlzdGVuZXJzOiBbXSxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2VsZWN0b3Iub3B0cyA9IE9iamVjdC5hc3NpZ24oc2VsZWN0b3Iub3B0cywgb3B0cyk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdyZXBsYWNlT25UeXBlJywgJ2tleXByZXNzJywgZSA9PiB7XG4gICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9yZXBsYWNlVHlwZWQuY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnRvZ2dsZUxpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uUGFzdGUnLCAncGFzdGUnLCBlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9yZXBsYWNlUGFzdGVkLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihzZWxlY3RvciwgJ2hvdFN3aXRjaCcsICdrZXlwcmVzcycsIGUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX2hvdFN3aXRjaC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsICdjaGVja0ZvY3VzJywgJ2ZvY3VzJywgZSA9PiB7XG4gICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl9jaGVja0ZvY3VzLmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2xvYmFsQ2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KTtcblxuICAgICAgICAgICAgICAgIGlmICghZ2xvYmFsQ2hlY2tib3gub3B0cykge1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWxDaGVja2JveC5vcHRzID0geyB3YXRjaENoZWNrYm94OiB0cnVlLCBsaXN0ZW5lcnM6IFtdLCB9O1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMudG9nZ2xlTGlzdGVuZXIoZ2xvYmFsQ2hlY2tib3gsICd3YXRjaENoZWNrYm94JywgJ2NoYW5nZScsIGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl93YXRjaENoZWNrYm94LmNhbGwodGhpcywgZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxlY3Rvci5vcHRzLmNoZWNrYm94KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2hlY2tib3ggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yLm9wdHMuY2hlY2tib3gpO1xuXG4gICAgICAgICAgICAgICAgaWYgKCFjaGVja2JveC5vcHRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNoZWNrYm94Lm9wdHMgPSB7IHdhdGNoQ2hlY2tib3g6IHRydWUsIGxpc3RlbmVyczogW10sIH07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdGhpcy50b2dnbGVMaXN0ZW5lcihjaGVja2JveCwgJ3dhdGNoQ2hlY2tib3gnLCAnY2hhbmdlJywgZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3dhdGNoQ2hlY2tib3guY2FsbCh0aGlzLCBlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RvcnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5zZWxlY3RvcnMuY29uY2F0KHNlbGVjdG9ycykpKTtcblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrLmNhbGwodGhpcywgc2VsZWN0b3JzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgdG9nZ2xlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbiwgdXNlQ2FwdHVyZT1mYWxzZSkge1xuICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3Iub3B0c1tsaXN0ZW5lcl0pIHtcbiAgICAgICAgICAgIGlmIChpbmRleCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZExpc3RlbmVyKHNlbGVjdG9yLCBsaXN0ZW5lciwgdHlwZSwgZm4sIHVzZUNhcHR1cmUpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIsIHR5cGUsIHVzZUNhcHR1cmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlLCBmbikge1xuICAgICAgICBzZWxlY3Rvci5vcHRzLmxpc3RlbmVycy5wdXNoKHtbbGlzdGVuZXJdOiBmbn0pO1xuICAgICAgICBzZWxlY3Rvci5hZGRFdmVudExpc3RlbmVyKHR5cGUsIHRoaXMuZ2V0TGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSk7XG4gICAgfVxuXG4gICAgcmVtb3ZlTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyLCB0eXBlKSB7XG4gICAgICAgIHNlbGVjdG9yLnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgdGhpcy5nZXRMaXN0ZW5lcihzZWxlY3RvciwgbGlzdGVuZXIpKTtcbiAgICAgICAgc2VsZWN0b3Iub3B0cy5saXN0ZW5lcnMuc3BsaWNlKHRoaXMuaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSwgMSk7XG4gICAgfVxuXG4gICAgaGFzTGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gc2VsZWN0b3Iub3B0cy5saXN0ZW5lcnMuZmluZEluZGV4KGYgPT4gdHlwZW9mIGZbbGlzdGVuZXJdID09PSAnZnVuY3Rpb24nKTtcbiAgICAgICAgcmV0dXJuIGluZGV4ID09PSAtMSA/IGZhbHNlIDogaW5kZXg7XG4gICAgfVxuXG4gICAgZ2V0TGlzdGVuZXIoc2VsZWN0b3IsIGxpc3RlbmVyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZWN0b3Iub3B0cy5saXN0ZW5lcnMuZmluZChmID0+IGZbbGlzdGVuZXJdKVtsaXN0ZW5lcl07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgVGhlcmUgaXMgbm8gc3VjaCBsaXN0ZW5lciBhcyAnJHtsaXN0ZW5lcn0nIGZvciAnJHtzZWxlY3Rvci5vdXRlckhUTUx9Jy4uLmApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2VuYWJsZShzZWxlY3RvciwgZW5hYmxlQ2hlY2tib3g9dHJ1ZSkge1xuICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgIHNlbGVjdG9yLm9wdHMucmVwbGFjZU9uVHlwZSA9IHRydWU7XG5cbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCBlID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29uc3RydWN0b3IuX3JlcGxhY2VUeXBlZC5jYWxsKHRoaXMsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXSkge1xuICAgICAgICAgICAgc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXS5jYWxsKHRoaXMsIHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGVjdG9yLm9wdHMuY2hlY2tib3ggJiYgZW5hYmxlQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3Iub3B0cy5jaGVja2JveCkuY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpLmNoZWNrZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2Rpc2FibGUoc2VsZWN0b3IsIGRpc2FibGVDaGVja2JveD10cnVlKSB7XG4gICAgICAgIHNlbGVjdG9yID0gdGhpcy5jb25zdHJ1Y3Rvci5nZXRDb250ZXh0KHNlbGVjdG9yKTtcbiAgICAgICAgc2VsZWN0b3Iub3B0cy5yZXBsYWNlT25UeXBlID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihzZWxlY3RvciwgJ3JlcGxhY2VPblR5cGUnLCAna2V5cHJlc3MnLCB0aGlzLmdldExpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpKTtcblxuICAgICAgICBpZiAoc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXSkge1xuICAgICAgICAgICAgc2VsZWN0b3Iub3B0c1snb25DaGFuZ2UnXS5jYWxsKHRoaXMsIGZhbHNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3Rvci5vcHRzLmNoZWNrYm94ICYmIGRpc2FibGVDaGVja2JveCkge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvci5vcHRzLmNoZWNrYm94KS5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpIHsvLz9cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5wYXJhbXMuZ2xvYmFsQ2hlY2tib3gpLmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHN0YXRpYyBfcmVwbGFjZVR5cGVkKGUpIHtcbiAgICAgICAgaWYgKCFuZXcgUmVnRXhwKHRoaXMuY29uc3RydWN0b3IuY2hhcmFjdGVyU2V0LmpvaW4oJ3wnKSkudGVzdChlLmtleSkgfHwgZS5rZXkubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgLy98fCAhdGhpcy5vLmFjdGl2ZSkge1xuICAgICAgICAgICAgLy98fCAhZS5jdXJyZW50VGFyZ2V0Lm9wdHMuYWN0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coJ3JldHVybicpO1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaW5zZXJ0QXRDYXJldChlLmN1cnJlbnRUYXJnZXQsIFN0cmluZy5mcm9tQ2hhckNvZGUodGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihlLmtleSkgKyA0MzA0KSk7XG4gICAgfVxuXG4gICAgc3RhdGljIF9yZXBsYWNlUGFzdGVkKGUpIHtcbiAgICAgICAgbGV0IGNvbnRlbnQgPSBlLmNsaXBib2FyZERhdGEgPyBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpIDogd2luZG93LmNsaXBib2FyZERhdGEgP1xuICAgICAgICAgICAgd2luZG93LmNsaXBib2FyZERhdGEuZ2V0RGF0YSgnVGV4dCcpIDogbnVsbDtcblxuICAgICAgICBpbnNlcnRBdENhcmV0KGUuY3VycmVudFRhcmdldCwgY29udGVudC5zcGxpdCgnJylcbiAgICAgICAgICAgIC5tYXAoYyA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5jb25zdHJ1Y3Rvci5jaGFyYWN0ZXJTZXQuaW5kZXhPZihjKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gaW5kZXggIT09IC0xID8gU3RyaW5nLmZyb21DaGFyQ29kZShpbmRleCArIDQzMDQpIDogYztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuam9pbignJykpO1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgX2NoZWNrRm9jdXMoZSkge1xuICAgICAgICBpZiAoZS5jdXJyZW50VGFyZ2V0Lm9wdHMuY2hlY2tib3gpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZS5jdXJyZW50VGFyZ2V0Lm9wdHMuY2hlY2tib3gpLmNoZWNrZWQgPSBlLmN1cnJlbnRUYXJnZXQub3B0cy5yZXBsYWNlT25UeXBlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KS5jaGVja2VkID0gZS5jdXJyZW50VGFyZ2V0Lm9wdHMucmVwbGFjZU9uVHlwZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubGFzdEZvY3VzID0gZS5jdXJyZW50VGFyZ2V0O1xuICAgIH1cblxuICAgIHN0YXRpYyBfd2F0Y2hDaGVja2JveChlKSB7XG4gICAgICAgIGxldCBzZWxlY3RvcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRoaXMucGFyYW1zLmdsb2JhbENoZWNrYm94KSA9PT0gZS5jdXJyZW50VGFyZ2V0ID8gdGhpcy5zZWxlY3RvcnMgOlxuICAgICAgICAgICAgdGhpcy5zZWxlY3RvcnMuZmlsdGVyKHNlbGVjdG9yID0+IHtcbiAgICAgICAgICAgICAgICBzZWxlY3RvciA9IHRoaXMuY29uc3RydWN0b3IuZ2V0Q29udGV4dChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yLm9wdHMuY2hlY2tib3gpID09PSBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgc2VsZWN0b3JzLmZvckVhY2gocyA9PiB7XG4gICAgICAgICAgICBlLmN1cnJlbnRUYXJnZXQuY2hlY2tlZCA/IHRoaXMuX2VuYWJsZShzKSA6IHRoaXMuX2Rpc2FibGUocyk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgaWYgKHRoaXMubGFzdEZvY3VzICYmIHNlbGVjdG9ycy5pbmNsdWRlcyh0aGlzLmxhc3RGb2N1cy5mcmFtZUVsZW1lbnQgfHwgdGhpcy5sYXN0Rm9jdXMpKSB7XG4gICAgICAgICAgICB0aGlzLmxhc3RGb2N1cy5mb2N1cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLmdldENvbnRleHQoc2VsZWN0b3JzWzBdKS5mb2N1cygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF9ob3RTd2l0Y2goZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09PSB0aGlzLnBhcmFtcy5ob3RTd2l0Y2hLZXkgfHwgZS53aGljaCA9PT0gdGhpcy5wYXJhbXMuaG90U3dpdGNoS2V5KSB7XG4gICAgICAgICAgICB0aGlzLmNvbnN0cnVjdG9yLl90b2dnbGUuY2FsbCh0aGlzLCBlLmN1cnJlbnRUYXJnZXQpO1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIF90b2dnbGUoc2VsZWN0b3IpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmhhc0xpc3RlbmVyKHNlbGVjdG9yLCAncmVwbGFjZU9uVHlwZScpO1xuXG4gICAgICAgIGlmIChpbmRleCAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZGlzYWJsZShzLCBzID09PSBzZWxlY3RvcikpO1xuICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoLmNhbGwodGhpcywgZmFsc2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9kaXNhYmxlKHNlbGVjdG9yKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICB0aGlzLnNlbGVjdG9ycy5mb3JFYWNoKHMgPT4gdGhpcy5fZW5hYmxlKHMsIHMgPT09IHNlbGVjdG9yKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXMuZ2xvYmFsSG90U3dpdGNoLmNhbGwodGhpcywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX2VuYWJsZShzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBzdGF0aWMgX3dhcm5CYWRTZWxlY3RvcihzZWxlY3RvcnMpIHtcbiAgICAgICAgc2VsZWN0b3JzLnNwbGl0KCcsICcpLmZvckVhY2goc2VsZWN0b3IgPT4ge1xuICAgICAgICAgICAgaWYgKCFkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgLndhcm4oYCR7dGhpcy5jb25zdHJ1Y3Rvci5uYW1lfTogQW4gZWxlbWVudCB3aXRoIGlkZW50aWZpZXIgJyR7c2VsZWN0b3J9JyBub3QgZm91bmQuIChTa2lwcGluZy4uLilgKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldCBjaGFyYWN0ZXJTZXQoKSB7XG4gICAgICAgIHJldHVybiAnYWJnZGV2elRpa2xtbm9wSnJzdHVmcVJ5U0NjWndXeGpoJy5zcGxpdCgnJyk7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldENvbnRleHQoc2VsZWN0b3IpIHtcbiAgICAgICAgcmV0dXJuIChzZWxlY3Rvci50YWdOYW1lLnRvTG93ZXJDYXNlKCkgPT09ICdpZnJhbWUnKSA/XG4gICAgICAgICAgICAoc2VsZWN0b3IuY29udGVudFdpbmRvdyB8fCBzZWxlY3Rvci5jb250ZW50RG9jdW1lbnQpLndpbmRvdyA6IHNlbGVjdG9yO1xuICAgIH1cblxuICAgIC8vIE5vdCBpbXBsZW1lbnRlZFxuICAgIHN0YXRpYyBnZXQgcHJvcGVydHlOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIH1cbn1cblxud2luZG93Lkdlb2tleWJvYXJkID0gR2Vva2V5Ym9hcmQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL21haW4uanMiLCJjb25zdCBpbnNlcnRBdENhcmV0ID0gKGVsZW1lbnQsIGNvbnRlbnQpID0+IHtcblxuICAgIGNvbnN0IHRhZ05hbWUgPSAoZWxlbWVudC50YWdOYW1lIHx8IGVsZW1lbnQuZnJhbWVFbGVtZW50LnRhZ05hbWUpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICBpZiAodGFnTmFtZSA9PT0gJ2RpdicgfHwgdGFnTmFtZSA9PT0gJ2lmcmFtZScpIHtcbiAgICAgICAgbGV0IHNlbCwgcmFuZ2U7XG5cbiAgICAgICAgbGV0IHdpbmRvd0NvbnRleHQgPSB3aW5kb3csIGRvY3VtZW50Q29udGV4dCA9IGRvY3VtZW50O1xuICAgICAgICBpZiAodGFnTmFtZSA9PT0gJ2lmcmFtZScpIHtcbiAgICAgICAgICAgIHdpbmRvd0NvbnRleHQgPSBlbGVtZW50LndpbmRvdztcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dCA9IGVsZW1lbnQuZG9jdW1lbnQ7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAod2luZG93Q29udGV4dC5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHNlbCA9IHdpbmRvd0NvbnRleHQuZ2V0U2VsZWN0aW9uKCk7XG4gICAgICAgICAgICBpZiAoc2VsLmdldFJhbmdlQXQgJiYgc2VsLnJhbmdlQ291bnQpIHtcbiAgICAgICAgICAgICAgICByYW5nZSA9IHNlbC5nZXRSYW5nZUF0KDApO1xuICAgICAgICAgICAgICAgIHJhbmdlLmRlbGV0ZUNvbnRlbnRzKCk7XG5cbiAgICAgICAgICAgICAgICBsZXQgZWwgPSBkb2N1bWVudENvbnRleHQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZWwuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICAgICAgICAgICAgICBsZXQgZnJhZyA9IGRvY3VtZW50Q29udGV4dC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksIG5vZGUsIGxhc3ROb2RlO1xuICAgICAgICAgICAgICAgIHdoaWxlICgobm9kZSA9IGVsLmZpcnN0Q2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3ROb2RlID0gZnJhZy5hcHBlbmRDaGlsZChub2RlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmFuZ2UuaW5zZXJ0Tm9kZShmcmFnKTtcblxuICAgICAgICAgICAgICAgIGlmIChsYXN0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICByYW5nZSA9IHJhbmdlLmNsb25lUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgcmFuZ2Uuc2V0U3RhcnRBZnRlcihsYXN0Tm9kZSk7XG4gICAgICAgICAgICAgICAgICAgIHJhbmdlLmNvbGxhcHNlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgICAgICAgICAgICAgIHNlbC5hZGRSYW5nZShyYW5nZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24gJiYgZG9jdW1lbnRDb250ZXh0LnNlbGVjdGlvbi50eXBlICE9PSAnQ29udHJvbCcpIHtcbiAgICAgICAgICAgIGRvY3VtZW50Q29udGV4dC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKS5wYXN0ZUhUTUwoY29udGVudCk7XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRhZ05hbWUgPT09ICdpbnB1dCcgfHwgdGFnTmFtZSA9PT0gJ3RleHRhcmVhJykge1xuICAgICAgICBpZiAodHlwZW9mIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInICYmIHR5cGVvZiBlbGVtZW50LnNlbGVjdGlvbkVuZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gZWxlbWVudC5zZWxlY3Rpb25TdGFydDtcbiAgICAgICAgICAgIGVsZW1lbnQudmFsdWUgPSBlbGVtZW50LnZhbHVlLnNsaWNlKDAsIHN0YXJ0KSArIGNvbnRlbnQgKyBlbGVtZW50LnZhbHVlLnNsaWNlKGVsZW1lbnQuc2VsZWN0aW9uRW5kKTtcbiAgICAgICAgICAgIGVsZW1lbnQuc2VsZWN0aW9uU3RhcnQgPSBlbGVtZW50LnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICBsZXQgbm9ybWFsID0gZWxlbWVudC52YWx1ZS5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuXG4gICAgICAgICAgICBsZXQgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UubW92ZVRvQm9va21hcmsocmFuZ2UuZ2V0Qm9va21hcmsoKSk7XG5cbiAgICAgICAgICAgIGxldCBlbmRSYW5nZSA9IGVsZW1lbnQuY3JlYXRlVGV4dFJhbmdlKCk7XG4gICAgICAgICAgICBlbmRSYW5nZS5jb2xsYXBzZShmYWxzZSk7XG5cbiAgICAgICAgICAgIGxldCBzdGFydCwgZW5kO1xuICAgICAgICAgICAgaWYgKHRleHRJbnB1dFJhbmdlLmNvbXBhcmVFbmRQb2ludHMoJ1N0YXJ0VG9FbmQnLCBlbmRSYW5nZSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0ID0gZW5kID0gY2hhckxlbmd0aDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc3RhcnQgPSAtdGV4dElucHV0UmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtY2hhckxlbmd0aCk7XG4gICAgICAgICAgICAgICAgc3RhcnQgKz0gbm9ybWFsLnNsaWNlKDAsIHN0YXJ0KS5zcGxpdCgnXFxuJykubGVuZ3RoIC0gMTtcblxuICAgICAgICAgICAgICAgIGlmICh0ZXh0SW5wdXRSYW5nZS5jb21wYXJlRW5kUG9pbnRzKCdFbmRUb0VuZCcsIGVuZFJhbmdlKSA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IGNoYXJMZW5ndGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gLXRleHRJbnB1dFJhbmdlLm1vdmVFbmQoJ2NoYXJhY3RlcicsIC1jaGFyTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgZW5kICs9IG5vcm1hbC5zbGljZSgwLCBlbmQpLnNwbGl0KCdcXG4nKS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSA9IGVsZW1lbnQudmFsdWUuc2xpY2UoMCwgc3RhcnQpICsgY29udGVudCArIGVsZW1lbnQudmFsdWUuc2xpY2UoZW5kKTtcbiAgICAgICAgICAgIC8vc3RhcnQrKztcblxuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UgPSBlbGVtZW50LmNyZWF0ZVRleHRSYW5nZSgpO1xuICAgICAgICAgICAgdGV4dElucHV0UmFuZ2UuY29sbGFwc2UodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGluc2VydEF0Q2FyZXQ7XG5cblxuLy8gV0VCUEFDSyBGT09URVIgLy9cbi8vIC4vc3JjL2luc2VydC1hdC1jYXJldC5qcyJdLCJzb3VyY2VSb290IjoiIn0=