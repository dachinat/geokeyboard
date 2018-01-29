class Select {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        if (selectors) {
            this.selectors = selectors.split(', ');
        }

        this.opts = Object.assign({
            select: null,
            focusListenerOnSelect: true,
            selectListener: true,
            autoSwitch: true,
        }, opts);
    }

    redefine(selectors, opts) {
        this.opts = Object.assign(this.opts, opts);
        if (this.selectors) {
            this.selectors = Array.from(new Set(this.selectors.concat(selectors.split(', '))));
        } else {
            this.selectors = selectors.split(', ');
        }
    }

    listeners() {
        if (this.opts.select === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerOnSelect-'+i, 'focus', e => this.updateSelectValue.call(this, e)]
            ]]);
        });

        schema.push([this.opts.select, [
            ['selectListener', 'change', e => this.changeHandler.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.select).value = 'true';
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        const selectors = Array.from(document.querySelectorAll(this.selectors.join(',')));
        if (this.opts.autoSwitch && selectors.includes(selector)) {
            document.querySelector(this.opts.select).value = 'false';
        }
    }

    changeHandler(e) {
        this.selectors.forEach(s => {
            const selector = document.querySelector(s);
            const value = JSON.parse(e.currentTarget.value);

            if (value === true) {
                this.parent._enable.call(this.parent, selector);
            } else {
                this.parent._disable.call(this.parent, selector);
            }
        });


        this.parent._focus(document.querySelector(this.selectors));
    }

    updateSelectValue(e) {
        document.querySelector(this.opts.select).value = e.currentTarget[this.parent.constructor.opts].replaceOnType
            .toString();
    }

    // For global usage
    static build(geokb, params={}) {
        Select.geokb = geokb;

        if (!Select.params) {
            Select.params = {
                select: null,
                focusListener: true,
                autoSwitch: true
            }
        }
        Select.params = Object.assign(Select.params, params);

        const globalSelect = document.querySelector(Select.params.select);

        globalSelect.addEventListener('change', (e) => {
            geokb.selectors.forEach(s => e.currentTarget.value === 'true' ? geokb._enable(s) : geokb._disable(s));
            geokb._focus(geokb.selectors);
        });

        geokb.selectors.forEach(s => {
           s.addEventListener('focus', (e) => {
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

    static globalEnabled(force) {
        if (Select.params.autoSwitch || force) {
            document.querySelector(Select.params.select).value = 'true';
        }
    }

    static globalDisabled(force) {
        if (Select.params.autoSwitch || force) {
            document.querySelector(Select.params.select).value = 'false';
        }
    }
}

module.exports = Select;