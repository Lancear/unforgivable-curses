import Calculator from './Calculator.js'

main();

/**
 * The entry point of this application
 */
export function main() {
  console.log(Calculator.add(1, 3));
  console.log(Calculator.sub(1, 3));
  console.log(Calculator.mul(1, 3));
  console.log(Calculator.div(1, 3));
}
