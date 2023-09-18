const exec = (fn) => Promise.resolve().then(fn);

exec(() => {
  const a = 5;
  const b = 3;
  const sum = a + b;
  const double = (n) => n * 2;

  return { a, b, sum, double };
})
.then(({ a, b, sum, double }) => {
  exec(() => console.log(`The sum of ${a} and ${b} is ${sum}`));
  
  exec(() => {
    const twice = double(sum);
    return { twice };
  })
  .then(({ twice }) => console.log(`Twice the sum is  ${twice}`));

  exec(() => {
    console.log("Nobody gives a fuck about me");
    const _ = 3;
    console.log(`The value of _ is ${_}`);
  });
});