// Cascade operator implementation in javascript.
////////////////////////////////////////////////////////////////////////////////////////////////////
// Due to syntax limitations, this implementation uses .$. as the operator instead of .. like in dart.
// Yes, you can simply always return self/this instead of using a cascade operator.
// The goal of this challenge, however, was to create something as close to darts cascade operator
// as possible.
// 
// This implementation works by wrapping the return value of all functions as selfish values. 
// Unfortunatly, this does not work with undefined/null/symbol values.
// There are however 3 simple ways to handle this:
// 1. Simply return this/self and remember to access it without the cascade operator.
// 2. Return the most useful value for the given function instead of nothing.
// 3. Wrap the value in an object which can then be wrapped as selfish values. (RECOMMENDED)

import Calculation from './module.js';

const result = new Calculation(3)
  .add(4)
  .$.mul(2)
  .$.sub(1)
  .$.print();

console.log(result);
