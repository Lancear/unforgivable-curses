const fs = require('fs');
Array = require('./array-methods-i-miss');

const defaultIgnores = [
  './node_modules',
  './package.json',
  './package-lock.json'
];

module.exports = new class Project {
  
  ignore;
  ignoreSlash;
  projectPath;
  projectName;

  load(projectPath, ignore, ignoreSlash = '/') {
    this.ignore = ignore.concat(defaultIgnores);
    this.ignoreSlash = ignoreSlash;

    const path = projectPath;
    this.projectPath = `${path}\\`;
    this.projectName = path.split('\\').last();

    this.loadDirectory(path, global);
  }

  loadExternal(name, alias = name) {
    if (!global[this.projectName].external) {
      global[this.projectName].external = {};
    }
    
    return global[this.projectName].external[alias] = require(name);
  }

  share(key, value) {
    if (!global[this.projectName].shared) {
      global[this.projectName].shared = {};
    }
    
    global[this.projectName].shared[key] = value;
  }

  freezeGlobals() {
    Object.freeze(global[this.projectName]);
  }

  loadDirectory(path, parent) {
    if (this.shouldBeIgnored(path)) return;

    const name = path.split('\\').last();
    const items = fs.readdirSync(path);
    parent[name] = {};
    
    for(let item of items) {
      const itemPath = `${path}\\${item}`;

      if (fs.lstatSync(itemPath).isDirectory()) {
        this.loadDirectory(itemPath, parent[name]);
      }
      else {
        this.loadFile(itemPath, parent[name]);
      }
    }
  }

  loadFile(path, parent) {
    if (this.shouldBeIgnored(path)) return;

    const nameAndType = path.split('\\').last();
    const name = nameAndType.split('.').first();
    const type = nameAndType.split('.').last();

    if (type.startsWith('js')) {
      parent[name] = require(path);
    }
  }

  shouldBeIgnored(path) {
    return this.ignore.includes( path.replace(this.projectPath, `.${this.ignoreSlash}`) );
  }

};
