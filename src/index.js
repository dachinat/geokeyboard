//require('babel-polyfill');

const insertAtCaret = require("./insert-at-caret");

class Geokeyboard {
    constructor(selectors, params={}, opts={}) {
        this.selectors = [];

        this.params = Object.assign({
            hotSwitchKey: 96
        }, params);

        this.listen(selectors, opts);
    }

    listen(selectors, opts={}, callback=null) {
        this.constructor._warnBadSelector(selectors);

        selectors = Array.from(document.querySelectorAll(selectors));

        selectors.forEach(selector => {
            selector = (selector.tagName.toLowerCase() === 'iframe') ?
                (selector.contentWindow || selector.contentDocument).window : selector;

            if (!selector.opts) {`
                selector.opts = {
                    replaceOnType: true,
                    hotSwitch: true,
                    onChange: null,
                    listeners: [],
                    active: true
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
                this.constructor._hotSwitch.call(this, e)
            });
        });

        this.selectors = Array.from(new Set(this.selectors.concat(selectors)));

        if (callback) {
            callback.call(this, selectors);
        }

        return this;
    }

    toggleListener(selector, listener, type, fn) {
        const index = this.hasListener(selector, listener);
        if (selector.opts[listener]) {
            if (index === false) {
                selector.opts.listeners.push({[listener]: fn});
                selector.addEventListener(type, this.getListener(selector, listener));
            }
        } else {
            if (index !== false) {
                selector.removeEventListener(type, this.getListener(selector, listener));
                selector.opts.listeners.splice(index, 1);
            }
        }
    }

    hasListener(selector, listener) {
        const index = selector.opts.listeners.findIndex(f => f[listener]);
        return index === -1 ? false : index;
    }

    getListener(selector, listener) {
        return selector.opts.listeners.find(f => f[listener])[listener];
    }

    static _replaceTyped(e) {
        if (!new RegExp(this.constructor.characterSet.join('|')).test(e.key) || e.key.length > 1
            //|| !this.o.active) {
            || !e.currentTarget.opts.active) {
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

    static _hotSwitch(e) {
        if (e.keyCode === this.params.hotSwitchKey) {
            this.constructor._toggle.call(this, e.currentTarget);
            e.preventDefault();
        }
    }

    static _toggle(selector) {
        //this.params.active = !this.params.active;
        selector.opts.active = !selector.opts.active;

        if (selector.opts['onChange']) {
            selector.opts['onChange'].call(this, selector.opts.active);//this.params.active);
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

    // Not implemented
    static get propertyName() {
        return this.constructor.name;
    }
}

window.Geokeyboard = Geokeyboard;