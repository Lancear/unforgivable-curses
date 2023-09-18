import CalculatorModes from './CalculatorModes.js';

/**
 * A simple reverse calculator module
 */
export default class ReverseCalculator {

  /**
   * Reverses an addition of two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the sum
   */
  static add(a, b) {
    return a - b;
  }

  /**
   * Reverses a subtraction of two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the difference
   */
  static sub(a, b) {
    return a + b;
  }

  /**
   * Reverses a multiplication of two numbers
   * @param {Number} a 
   * @param {Number} b 
   * @returns {Number} the product
   */
  static mul(a, b) {
    return a / b;
  }

}

/**
 * @type {CalculatorModes}
 */
export const mode = CalculatorModes.reversed;
