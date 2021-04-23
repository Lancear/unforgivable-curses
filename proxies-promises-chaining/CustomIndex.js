class CustomIndex {
    
    constructor(onGet) {
        const get = (obj, key) => onGet(obj, key);
        return new Proxy({}, { get });
    }

    static addFor(obj, onGet) {
        const get = (obj, key) => (key in obj) ? obj[key] : onGet(obj, key);
        return new Proxy(obj, { get });
    }

}

module.exports = CustomIndex;