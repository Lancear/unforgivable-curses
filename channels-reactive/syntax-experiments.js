// syntax 1
// from(1).to(10)
//   .map((num) => num * 2).as('double')
//   .and.map((num) => num / 2).as('half')
//   .combine('double', 'half')
//   .forEach((double, half) => console.log('Double:', double, '\nHalf:', half));


// syntax 2
// const range = from(1).to(10);               // 1 loop 1 ... 10 -> generate values
// const double = range.map(num => num * 2);   // 1 loop 1 ... 10 -> map all values
// const half = range.map(num => num / 2);     // 1 loop 1 ... 10 -> map all values

// combine({ original: range, double, half }).forEach(({ original, double, half }) => {
//   console.log("original:", original);
//   console.log("Double:", double);
//   console.log("Half:", half);
// });


// syntax 3
const generateNumbers = () => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
};

const twice = num => num * 2;
const halve = num => num / 2;
const printNumberInfo = ({ original, double, half }) => {
  console.log("Original:", original);
  console.log("Double:", double);
  console.log("Half:", half)
};

{ original: generateNumbers(); }
{ // element dependency (original) -> need only one element to progress
  double: original.map(twice);
  half: original.map(halve);
}
{ // element dependency (original, double, half) -> need only one element to progress
  for(let index = 0; index < original.length; index++) {
    console.log("Original:", original[index]);
    console.log("Double:", double[index]);
    console.log("Half:", half[index]);
  }
}


// should be generated as:
// for(let counter = 1; counter <= 10; counter++) {
//   console.log("Original:", counter);

//   const double = counter * 2;
//   console.log("Double:", double);

//   const half = counter / 2;
//   console.log("Half:", half);
// }