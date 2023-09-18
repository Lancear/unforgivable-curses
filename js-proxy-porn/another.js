const Scope = {
  _modules: new Map(),
  _functions: new Map(),

  add(module) {
    this._modules.set(module.name, module);
    Object.entries(module)
      .filter(([k, v]) => typeof v === "function")
      .forEach(([k, v]) => {
        this._functions.set(k, v);
        this._functions.set(`${module.name}.${k}`, v);
      });
  },
};
