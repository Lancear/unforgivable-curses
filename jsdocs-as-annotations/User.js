const Interface = require('./Interface');

class User extends Interface {

  /** @type {String} @pattern {"[a-zA-Z0-9_\-]"} */
  username;

  /** @type {String} */
  email;

  /**
   * @type {Number}
   * @min {0}
   */
  age;
  
}

console.dir( User.model );
