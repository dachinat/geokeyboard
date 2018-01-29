class Checkbox {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.lastFocus = null;
        this.opts = Object.assign({
            checkbox: null,
            focusListenerOnCheckbox: true,
            checkboxListener: true,
            autoSwitch: true,
        }, opts);
    }

    changeHandler(e) {
        this.selectors.forEach(s => {
            const selector = document.querySelector(s);

            if (e.currentTarget.checked === true) {
                this.parent._enable.call(this.parent, selector);
            } else {
                this.parent._disable.call(this.parent, selector);
            }
        });

        this.parent._focus(document.querySelector(this.selectors));
    }

    updateCheckbox(e) {
        e.currentTarget.checked = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    // For local usage
    redefine(selectors, opts) {
        this.opts = Object.assign(this.opts, opts);
        if (this.selectors) {
            this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
        } else {
            this.selectors = selectors.split(', ');
        }
    }

    listeners() {
        if (this.opts.checkbox === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerOnCheckbox-'+i, 'focus', e => this.updateCheckbox.call(this, e)]
            ]]);
        });

        schema.push([this.opts.checkbox, [
            ['checkboxListener', 'change', e => this.changeHandler.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.checkbox).checked = true;
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.checkbox).checked = false;
        }
    }

    // For global usage
    static build(geokb, params={}) {
        Checkbox.geokb = geokb;

        if (!Checkbox.params) {
            Checkbox.params = {
                checkbox: null,
                focusListener: true,
                autoSwitch: true
            };
        }
        Checkbox.params = Object.assign(Checkbox.params, params);

        const globalCheckbox = document.querySelector(Checkbox.params.checkbox);

        globalCheckbox.addEventListener('change', (e) => {
            geokb.selectors.forEach(s => e.currentTarget.checked ? geokb._enable(s) : geokb._disable(s));
            geokb._focus(geokb.selectors);
        });

        geokb.selectors.forEach(s => {
            s.addEventListener('focus', (e) => {
                e.currentTarget.checked = e.target.replaceOnType;
            });
        });

        if (geokb.params.forceEnabled) {
            Checkbox.globalEnabled(true);
        }
    }

    static globalEnabled(force) {
        if (Checkbox.params.autoSwitch || force) {
            document.querySelector(Checkbox.params.checkbox).checked = true;
        }
    }

    static globalDisabled(force) {
        if (Checkbox.params.autoSwitch || force) {
            document.querySelector(Checkbox.params.checkbox).checked = false;
        }
    }
}

module.exports = Checkbox;