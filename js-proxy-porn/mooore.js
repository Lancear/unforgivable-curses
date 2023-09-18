define(`A €{amount} coin`, ({amount}) => parsePrice(amount));

define(`Paying for a €{amount} item`, (given, amount) => {
  return given - parsePrice(amount);
});

function parsePrice(str) {
  return parseFloat(str.replace(',', '.'));
}

////////////////////////////////////////////////////////////////////////////////

console.dir(
  given `A €2,- coin`.
  when  `Paying for a €1.10 item`.
  then  (change => change == 0.90)
);





const definitions = [];
function define(template, code) {
  definitions.push({ template, code });
}

function findDefinition(str) {
  for (const definition of definitions) {
    const regex = definition.template.replace(/\{.*\}/g, '\\w');
    
  }
}


function given([text]) {
  console.log(`Given: ${text}`);

  return {
    when([text]) {
      console.log(`When:  ${text}`);

      return {
        then(test) {
          console.log(`Then:  ${test.toString().split('=>').at(-1).trim()}`);
          return test(0.9);
        }
      }
    }
  }
}




