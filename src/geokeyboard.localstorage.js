class LocalStorage {
    constructor(parent, selectors=null, params={}) {
        this.parent = parent;

        this.params = Object.assign({
            key: 'geokeyboard_global'
        }, params);

        this.load();
    }

    enabled() {
        localStorage.setItem(this.params.key, true);
    }

    disabled() {
        localStorage.setItem(this.params.key, false);
    }

    load() {
        const state = JSON.parse(localStorage.getItem(this.params.key));

        if (state === null) {
            return;
        }

        this.parent.selectors.forEach(s => state ? this.parent._enable(s) : this.parent._disable(s));
    }
}

module.exports = LocalStorage;