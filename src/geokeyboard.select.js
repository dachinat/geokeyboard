class Select {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        // Assuming state is global if no selectors
        if (selectors) {
            this.selectors = Array.from(document.querySelectorAll(selectors));
        } else {
            this.selectors = this.parent.selectors;
        }

        this.opts = Object.assign({
            select: null,
            focusListenerForSelect: true,
            selectListener: true,
            autoSwitch: true,
        }, opts);

        this.select = document.querySelector(this.opts.select) || null;

        this.select.value = this.selectors[0][this.parent.constructor.opts].replaceOnType.toString();

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    selectChanged(e) {
        this.selectors.forEach(s => {
            const currentValue = e.currentTarget.value;
            if (currentValue === 'true') {
                this.parent._enable.call(this.parent, s);
            } else if (currentValue === 'false') {
                this.parent._disable.call(this.parent, s);
            }
        });

        this.parent._focus(this.selectors);
    }

    updateSelect(e) {
        this.select.value = e.currentTarget[this.parent.constructor.opts].replaceOnType;
    }

    listeners() {
        if (this.select === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerForSelect-'+i, 'focus', e => this.updateSelect.call(this, e)]
            ]]);
        });

        schema.push([this.select, [
            ['selectListener', 'change', e => this.selectChanged.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
            this.select.value = 'true';
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
            this.select.value = 'false';
        }
    }
}

module.exports = Select;