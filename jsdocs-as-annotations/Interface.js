const models = new Map();


module.exports = class Interface {

  static get model() {
    if (models.has(this)) return models.get(this);

    const code = this.toString();
    let docstring = null;
    let field = null;
    let objModel = {};

    for (let charIdx = 0; charIdx < code.length; charIdx++) {
      if (docstring === null) {
        if (code[charIdx - 2] === '/' && code[charIdx - 1] === '*' && code[charIdx] === '*') docstring = '';
      }
      else if (field === null) {
        if (code[charIdx] === '*' && code[charIdx + 1] === '/') {
          field = '';
          do charIdx++; while (' \t\r\n'.includes(code[charIdx + 1]));
        }
        else docstring += code[charIdx];
      }
      else {
        if (code[charIdx].match(/[a-zA-Z0-9$#_]/)) field += code[charIdx];
        else {
          docstring = docstring.split(/[* \t\r\n]/).filter(part => part.length > 0).join(' ');

          const specStrings = docstring.split('@').filter(part => part.length > 0);
          const specs = specStrings.map(specsString => specsString.split(' ').filter(part => part.length > 0));
          const fieldModel = specs.reduce((model, [specName, specOptions = true]) => ({...model, [specName]: specOptions}), {});

          objModel = {...objModel, [field]: fieldModel};
          docstring = null;
          field = null;
        }
      }
    }

    models.set(this, objModel);
    return objModel;
  }

};
