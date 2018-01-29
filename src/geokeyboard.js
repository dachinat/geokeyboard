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
        let inst;
        for (let i of this.extensions) {
            if (i instanceof ext) {
                inst = i;
                break;
            }
        }
        if (!inst) {
            inst = Reflect.construct(ext, [this, params, opts]);
        } else {
            inst.redefine(params, opts);
        }
        this.extensions.add(inst);

        const l = inst.listeners();
        if (!l) {
            return;
        }

        l.forEach(el => {
            let selector = document.querySelector(el[0]);

            let extOpts = el[1].reduce((acc, c) => Object.assign(acc, {[c[0]]: true}), {listeners: []});

            if (!selector[this.constructor.opts]) {
                selector[this.constructor.opts] = extOpts;
            } else {
                selector[this.constructor.opts] = Object.assign(extOpts, selector[this.constructor.opts]);
            }
            selector[this.constructor.opts] = Object.assign(selector[this.constructor.opts], inst.opts);

            el[1].forEach(l => {
                this.toggleListener(selector, l[0], l[1], l[2]);
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
        if (!l) {
            //console.warn(`No such listener as '${listener}' for '${selector.outerHTML}'`);
        }
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