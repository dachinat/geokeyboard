const insertAtCaret = require("./insert-at-caret");

class Geokeyboard {
    constructor(selectors, params={}, opts={}) {
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

    listen(selectors, opts={}, callback=null) {
        this.constructor._warnBadSelector(selectors);

        selectors = Array.from(document.querySelectorAll(selectors));

        selectors.forEach(selector => {
            selector = this.constructor.getContext(selector);

            if (!selector.opts) {
                selector.opts = {
                    replaceOnType: true,
                    hotSwitch: true,
                    onChange: null,
                    checkbox: null,
                    checkFocus: true,
                    listeners: [],
                };
            }
            selector.opts = Object.assign(selector.opts, opts);

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

            if (this.params.globalCheckbox) {
                const globalCheckbox = document.querySelector(this.params.globalCheckbox);

                if (!globalCheckbox.opts) {
                    globalCheckbox.opts = { watchCheckbox: true, listeners: [], };
                }

                this.toggleListener(globalCheckbox, 'watchCheckbox', 'change', e => {
                    this.constructor._watchCheckbox.call(this, e);
                });
            }

            if (selector.opts.checkbox) {
                const checkbox = document.querySelector(selector.opts.checkbox);

                if (!checkbox.opts) {
                    checkbox.opts = { watchCheckbox: true, listeners: [], };
                }

                this.toggleListener(checkbox, 'watchCheckbox', 'change', e => {
                    this.constructor._watchCheckbox.call(this, e);
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


    toggleListener(selector, listener, type, fn, useCapture=false) {
        const index = this.hasListener(selector, listener);

        if (selector.opts[listener]) {
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
        selector.opts.listeners.push({[listener]: fn});
        selector.addEventListener(type, this.getListener(selector, listener));
    }

    removeListener(selector, listener, type) {
        selector.removeEventListener(type, this.getListener(selector, listener));
        selector.opts.listeners.splice(this.hasListener(selector, listener), 1);
    }

    hasListener(selector, listener) {
        const index = selector.opts.listeners.findIndex(f => typeof f[listener] === 'function');
        return index === -1 ? false : index;
    }


    getListener(selector, listener) {
        const l = selector.opts.listeners.find(f => f[listener]);
        if (!l) {
            //console.warn(`No such listener as '${listener}' for '${selector.outerHTML}'`);
        }
        return l ? l[listener] : undefined;
    }

    _enable(selector, enableCheckbox=true) {
        selector = this.constructor.getContext(selector);
        selector.opts.replaceOnType = true;

        this.addListener(selector, 'replaceOnType', 'keypress', e => {
            this.constructor._replaceTyped.call(this, e);
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

    _disable(selector, disableCheckbox=true) {
        selector = this.constructor.getContext(selector);
        selector.opts.replaceOnType = false;

        const listener = this.getListener(selector, 'replaceOnType');
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

        if (this.params.globalCheckbox) {//?
            document.querySelector(this.params.globalCheckbox).checked = false;
        }

        if (this.params.useLocalStorage) {
            this.constructor._addToLocalStorage.call(this, false);
        }
    }

    _loadLocalStorage() {
        const state = JSON.parse(localStorage.getItem(this.constructor.localStorageKey));

        console.log(state);

        if (state === null) {
            return;
        }

        this.selectors.forEach(s => {
            return state ? this._enable(s) : this._disable(s);
        });
    }

    static _replaceTyped(e) {
        if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1) {
            //|| !this.o.active) {
            //|| !e.currentTarget.opts.active) {
            return;
        }
        e.preventDefault();

        insertAtCaret(e.currentTarget, String.fromCharCode(this.constructor.characterSet.indexOf(e.key) + 4304));
    }

    static _replacePasted(e) {
        let content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ?
            window.clipboardData.getData('Text') : null;

        insertAtCaret(e.currentTarget, content.split('')
            .map(c => {
                let index = this.constructor.characterSet.indexOf(c);
                return index !== -1 ? String.fromCharCode(index + 4304) : c;
            })
            .join(''));

        e.preventDefault();
    }

    static _checkFocus(e) {
        if (e.currentTarget.opts.checkbox) {
            document.querySelector(e.currentTarget.opts.checkbox).checked = e.currentTarget.opts.replaceOnType;
        }

        if (this.params.globalCheckbox) {
            document.querySelector(this.params.globalCheckbox).checked = e.currentTarget.opts.replaceOnType;
        }

        this.lastFocus = e.currentTarget;
    }

    static _watchCheckbox(e) {
        let selectors = document.querySelector(this.params.globalCheckbox) === e.currentTarget ? this.selectors :
            this.selectors.filter(selector => {
                selector = this.constructor.getContext(selector);
                return (document.querySelector(selector.opts.checkbox) === e.currentTarget);
            });

        selectors.forEach(s => {
            e.currentTarget.checked ? this._enable(s) : this._disable(s);
        });


        if (this.lastFocus && selectors.includes(this.lastFocus.frameElement || this.lastFocus)) {
            this.lastFocus.focus();
        } else {
           this.constructor.getContext(selectors[0]).focus();
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

    static _addToLocalStorage(state) {
        console.log('##'+state);
        localStorage.setItem(this.constructor.localStorageKey, state);
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
        return (selector.tagName.toLowerCase() === 'iframe') ?
            (selector.contentWindow || selector.contentDocument).window : selector;
    }

    static get localStorageKey() {
        return 'geokeyboard';
    }

    // Not implemented
    static get propertyName() {
        return this.constructor.name;
    }
}

window.Geokeyboard = Geokeyboard;