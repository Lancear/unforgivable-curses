import SelfishValue from './selfish.js';

export default class Calculation {
  constructor(initialValue = 0) {
    this.result = initialValue;
  }

  add(value) {
    return new SelfishValue(this, this.result += value);
  }

  sub(value) {
    return new SelfishValue(this, this.result -= value);
  }

  mul(value) {
    return new SelfishValue(this, this.result *= value);
  }

  div(value) {
    return new SelfishValue(this, this.result /= value);
  }

  mod(value) {
    return new SelfishValue(this, this.result %= value);
  }

  print() {
    console.log(this.result);
    return new SelfishValue(this, this.result);
  }
};
