class Checkbox {
    constructor(parent, selectors=null, opts={}) {
        this.parent = parent;

        // Assuming state is global if no selectors
        this.localSelectors = selectors;
        this._getSelectors();

        this.opts = Object.assign({
            checkbox: null,
            focusListenerForCheckbox: true,
            checkboxListener: true,
            autoSwitch: true,
        }, opts);

        this.checkbox = document.querySelector(this.opts.checkbox) || null;

        this.checkbox.checked = this.selectors[0][this.parent.constructor.opts].replaceOnType;

        if (!selectors) {
            this.parent._attachListeners(this);
        }
    }

    checkboxChanged(e) {
        this._getSelectors();
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

    listeners() {
        if (this.checkbox === null) {
            return;
        }

        const schema = [];

        this.selectors.forEach((s,i) => {
            schema.push([s, [
                ['focusListenerForCheckbox-'+i, 'focus', e => this.updateCheckbox.call(this, e)]
            ]]);
        });

        schema.push([this.checkbox, [
            ['checkboxListener', 'change', e => this.checkboxChanged.call(this, e)]
        ]]);

        return schema;
    }

    enabled(selector) {
        if (!this.selectors) {
            return;
        }
        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._enable.call(this.parent, s, true));
            this.checkbox.checked = true;
        }
    }

    disabled(selector) {
        if (!this.selectors) {
            return;
        }

        if (this.opts.autoSwitch && this.selectors.includes(selector.frameElement || selector)) {
            this.selectors.forEach(s => this.parent._disable.call(this.parent, s, true));
            this.checkbox.checked = false;
        }
    }

    _getSelectors() {
        this.selectors = this.localSelectors ? Array.from(document.querySelectorAll(selectors)) : this.parent.selectors;
        return this.selectors;
    }
}

module.exports = Checkbox;