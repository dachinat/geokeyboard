class Checkbox {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        // Assuming state is global if no selectors
        if (selectors) {
            this.selectors = Array.from(document.querySelectorAll(selectors));//selectors.split(', ');
        } else {
            this.selectors = this.parent.selectors;
        }

        this.opts = Object.assign({
            checkbox: null,
            focusListenerOnCheckbox: true,
            checkboxListener: true,
            autoSwitch: true,
        }, opts);

        this.checkbox = document.querySelector(this.opts.checkbox) || null;

        if (this.parent.params.forceEnabled) {
            this.selectors.forEach(s => this.enabled(s));
        } else {
            this.checkbox.checked = this.selectors[0][this.parent.constructor.opts].replaceOnType;
        }

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    changeHandler(e) {
        this.selectors.forEach(s => {
            if (e.currentTarget.checked === true) {
                this.parent._enable.call(this.parent, s);
            } else {
                this.parent._disable.call(this.parent, s);
            }
        });

        this.parent._focus(this.selectors);
    }

    updateCheckbox(e) {
        //this.selectors.forEach(s => this.checkbox.checked = s[this.parent.constructor.opts].replaceOnType);
        this.checkbox.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    // // For local usage
    // redefine(selectors, opts) {
    //     this.opts = Object.assign(this.opts, opts);
    //     if (this.selectors) {
    //         this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
    //     } else {
    //         this.selectors = selectors.split(', ');
    //     }
    // }

    listeners() {
        if (this.checkbox === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerOnCheckbox-'+i, 'focus', e => this.updateCheckbox.call(this, e)]
            ]]);
        });

        schema.push([this.checkbox, [
            ['checkboxListener', 'change', e => this.changeHandler.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector)) {
            this.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
            this.checkbox.checked = true;
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector)) {
            this.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
            this.checkbox.checked = false;
        }
    }

    // For global usage
    // build(parent, params={}) {
    //     this.parent = parent;
    //
    //     this.params = Object.assign({
    //         checkbox: null,
    //         focusListener: true,
    //         autoSwitch: true
    //     }, params);
    //
    //     this.globalCheckbox = document.querySelector(this.params.checkbox);
    //
    //     this.globalCheckbox.addEventListener('change', (e) => {
    //         this.parent.selectors.forEach(s => e.currentTarget.checked ?
    //             this.parent._enable(s) : this.parent._disable(s));
    //
    //         this.parent._focus(this.parent.selectors);
    //     });
    //
    //     this.parent.selectors.forEach(s => {
    //         s.addEventListener('focus', (e) => {
    //             this.globalCheckbox.checked = e.currentTarget[this.parent.constructor.opts]
    //                 .replaceOnType;
    //         });
    //     });
    //
    //     if (this.parent.params.forceEnabled) {
    //         this.globalEnabled(true);
    //     }
    // }
    //
    // globalEnabled(force) {
    //     console.log('en');
    //     if (this.params.autoSwitch || force) {
    //         this.globalCheckbox.checked = true;
    //     }
    //     this.parent.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
    // }
    //
    // globalDisabled(force) {
    //     console.log('dis');
    //     if (this.params.autoSwitch || force) {
    //         this.globalCheckbox.checked = false;
    //     }
    //     this.parent.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
    // }
}

module.exports = Checkbox;