module.exports = Array;

Array.prototype.first = function() {
  return this[0];
};

Array.prototype.second = function() {
  return this[1];
};

Array.prototype.third = function() {
  return this[2];
};

Array.prototype.last = function() {
  return this[this.length - 1];
};