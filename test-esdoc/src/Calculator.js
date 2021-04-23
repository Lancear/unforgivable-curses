import CalculatorModes from './CalculatorModes.js';

/**
 * A simple Calculator module
 */
export default class Calculator {

  /**
   * Adds two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the sum
   * 
   * const sum = Calculator.add(12, 15);
   * // sum: 27
   */
  static add(a, b) {
    return a + b;
  }

  /**
   * Subtracts two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the difference
   */
  static sub(a, b) {
    return a - b;
  }

  /**
   * Multiplies two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the product
   */
  static mul(a, b) {
    return a * b;
  }

  /**
   * Divides two numbers
   * @param {Number} a 
   * @param {Number} b non-zero number
   * @returns {Number} the quotient
   */
  static div(a, b) {
    if (b === 0) throw new Error('No division by 0 allowed!');
    return a / b;
  }

}

/**
 * @type {CalculatorModes}
 */
export const mode = CalculatorModes.normal;
