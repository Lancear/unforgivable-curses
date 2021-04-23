class ChainInfo {

  constructor(subject, result) {
    this.subject = subject;
    this.result = result;
  }

}

class ChainableFunction {
  constructor(fn, obj) {
    return Object.assign(fn, obj);
  }
}

const product = {
  name: 'Big fat juicy BBQ burger',
  price: 4.20
};

class ChainPath {
  constructor(name = '', fn = undefined, paths = {}) {
    this.name = name;
    this.fn = fn;
    this.paths = paths;
  }
}

class Chain {

  constructor(subject, recursive = false) {
    this.$subject = subject;
    this.$paths = new ChainPath();
    return new Proxy(this, { get: this.$getFromChain });
  }

  $register(path, fn) {
    let currChainPath = this.$paths;
    
    for (const pathPart of path.split('.')) {
      if (!(pathPart in currChainPath.paths)) currChainPath.paths[pathPart] = new ChainPath(pathPart);
      currChainPath = currChainPath.paths[pathPart];
    }

    currChainPath.fn = fn;
  }

  $getFromChain(target, key) {
    if (key.startsWith('$')) return target[key];


    if (key in target.$subject) return target.$subject[key];
  }

}

class MyChain extends Chain {

  constructor(subject, recursive) {
    super(subject, recursive);
    this.$register('has.property', ([subject], prop) => prop in subject);
    this.$register('is.equal.to', ([subject], val) => subject == val);
    this.$register('is.equal.to.or.greater.than', ([subject], val) => subject >= val);
    this.$register('is.greater.than', ([subject], val) => subject > val);
    this.$register('is.greater.than.or.equal.to', ([subject], val) => subject >= val);

    console.log(this.$paths);
  }

}

new MyChain(product);


// const chain =(subject)=> new ChainInfo(subject);
// const has =(chainInfo)=> chainInfo;
// const property =(chainInfo, prop)=> new ChainInfo(chainInfo.subject, prop in chainInfo.subject);

// let x = chain(product);
// x = has(x);
// x = property(x, 'price');
// x = x.result;

// console.log(testChain.is.equal.to.or.greater.than([4], 3));
