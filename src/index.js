//require('babel-polyfill');

const insertAtCaret = require("./insert-at-caret");

class Geokeyboard {
    constructor(selectors, params={}) {
        selectors.split(', ').forEach(selector => this.constructor._badSelector(selector));

        this.params = Object.assign({
            replaceOnType: true,
            replaceOnPaste: true,
            hotSwitch: true,
            changeCallback: null,
            activated: true,
        }, params);

        this.selectors = Array.from(document.querySelectorAll(selectors));
        this.selectors.forEach(selector => this.listen(selector));

        this._manageState();
    }

    listen(target=null) {
        if (!target) {
            this.selectors.forEach(selector => this.listen(selector));
            return this;
        }

        if (typeof target === 'string' || target instanceof String) {
            target.split(', ').forEach(selector => this.constructor._badSelector(selector));

            let selectors = Array.from(document.querySelectorAll(target));
            this.selectors = Array.from(new Set(this.selectors.concat(selectors)));
            selectors.forEach(selector => this.listen(selector));

            return this;
        }


        if (this.selectors.indexOf(target) === -1) {
            this.selectors.push(target);
        }

        let targetElement = (target.tagName.toLowerCase() === 'iframe') ?
           (target.contentWindow || target.contentDocument).window : target;

        if (this.params.replaceOnType) {
            targetElement.addEventListener('keypress', this.constructor._replaceTyped);
        }
        if (this.params.replaceOnPaste) {
            targetElement.addEventListener('paste', this.constructor._replacePasted);
        }

        if (this.params.hotSwitch) {
            const selector = this.selectors.find(s => s === (targetElement.frameElement || targetElement));

            if (!selector.hasHotSwitchListener) {
                selector.hasHotSwitchListener = true;

                selector.hotSwitchFunc = (e) => {
                    if (e.keyCode === 96) {
                        if (!this.selectors_) {
                            this.selectors_ = this.selectors;
                        }

                        if (!this.selectors_.includes(e.currentTarget) &&
                            !this.selectors_.includes(e.currentTarget.frameElement)) {
                            return;
                        }

                        if (this.selectors.length > 0) {
                            this.params.activated = false;
                            this.selectors_ = this.selectors;
                            this.unlisten();
                            this.params.changeCallback.call(this, false);
                        } else {
                            this.params.activated = true;
                            this.selectors = this.selectors_;
                            this.listen();
                            this.params.changeCallback.call(this, true);
                        }
                        e.preventDefault();
                    }
                };

                targetElement.addEventListener('keypress', selector.hotSwitchFunc);
            }
        }

        this._manageState();
        return this;
    }

    unlisten(target=null) {
        if (!target) {
            this.selectors.forEach(selector => this.unlisten(selector));
            return this;
        }

        if (typeof target === 'string' || target instanceof String) {
            target.split(', ').forEach(selector => this.constructor._badSelector(selector));

            let selectors = Array.from(document.querySelectorAll(target));

            this.selectors = this.selectors.filter(element => !selectors.includes(element));

            selectors.forEach(selector => this.unlisten(selector));

            return this;
        }

        this.selectors = this.selectors.filter(selector => selector !== target);

        let targetElement = (target.tagName.toLowerCase() === 'iframe') ?
            (target.contentWindow || target.contentDocument).window : target;

        targetElement.removeEventListener('keypress', this.constructor._replaceTyped);
        targetElement.removeEventListener('paste', this.constructor._replacePasted);

        return this;
    }

    change(fn) {
        this.params.changeCallback = fn;
        return this;
    }

    inactive() {
        if (this.params.activated) {
            this.params.activated = false;

            this.selectors_ = this.selectors;
            this.unlisten();
            return this;
        }
    }

    active() {
        if (!this.params.activated) {
            this.params.activated = true;

            if (this.selectors.length === 0) {
                this.selectors = this.selectors_;
            }

            this.listen();

            return this;
        }
    }

    static _replaceTyped(e) {
        if (!new RegExp(Geokeyboard.characterSet.join('|')).test(e.key) || e.key.length > 1) {
            return;
        }
        e.preventDefault();

        insertAtCaret(e.currentTarget, String.fromCharCode(Geokeyboard.characterSet.indexOf(e.key) + 4304));
    }

    static _replacePasted(e) {
        let content = e.clipboardData ? e.clipboardData.getData('text/plain') : window.clipboardData ?
            window.clipboardData.getData('Text') : null;

        insertAtCaret(e.currentTarget, content.split('')
            .map(c => {
                let index = Geokeyboard.characterSet.indexOf(c);
                return index !== -1 ? String.fromCharCode(index + 4304) : c;
            })
            .join(''));

        e.preventDefault();
    }

    _manageState() {
        if (!this.params.activated) {
            this.params.activated = true;
            return this.inactive();
        } else {
            this.params.activated = false;
            return this.active();
        }
        return this;
    }

    static _badSelector(selector) {
        if (!document.querySelector(selector)) {
            console
                .warn(`${this.constructor.name}: An element with identifier '${selector}' not found. (Skipping...)`);
            return true;
        }
    }

    static get characterSet() {
        return 'abgdevzTiklmnopJrstufqRySCcZwWxjh'.split('');
    }
}

window.Geokeyboard = Geokeyboard;