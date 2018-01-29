class LocalStorage {
    constructor(parent) {
        this.parent = parent;
    }
    // For global usage
    static build(geokb, params={}) {
        LocalStorage.geokb = geokb;

        LocalStorage.params = Object.assign({
            key: 'geokeyboard',
        }, params);

        LocalStorage._load.call(LocalStorage);
    }

    static globalEnabled() {
        console.log('enabled');
        localStorage.setItem(this.constructor.params.key, true);
    }

    static globalDisabled() {
        console.log('disabled!!!!');
        localStorage.setItem(this.constructor.params.key, false);
    }

    static _load() {
        if (this.geokb.params.forceEnabled) {
            return;
        }

        const state = JSON.parse(localStorage.getItem(this.params.key));

        if (state === null) {
            return;
        }

        this.geokb.selectors.forEach(s => {
            return state ? this.geokb._enable(s) : this.geokb._disable(s);
        });
    }
}

module.exports = LocalStorage;