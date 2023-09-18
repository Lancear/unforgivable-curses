const Get_User = require('./actions/Get_User');

console.warn(
  Get_User('Hans#1435'),
  Get_User('Peter#4321'),
  Get_User('nope!')
);
