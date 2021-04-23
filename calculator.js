Array.prototype.secondTop = function(){ return this[this.length - 2] };
Array.prototype.popSecond = function(){ const top = this.pop(), second = this.pop(); this.push(top); return second; };
console.dir( calculate("33 + 5 * 6 / 2 * 4 - 2 / 4") );

function calculate(input = "") {
  const tokens = input.split(' ').filter(token => token.length > 0);
  let ops = [], operands = [], precedence = { '+' : 1, '-': 1, '*': 2, '/': 2 }, tokenType = 'operand', nesting = 0;

  for (let token of tokens) {
    if (tokenType === 'operator' !== ['+', '-', '*', '/'].includes(token)) return Error(`Unexpected token '${token}'`);
    while (token.startsWith('(')) { nesting++; token = token.substring(1); }

    if (tokenType === 'operand') operands.push(parseFloat(token));
    else {
      ops.push({ nesting, op: token });
      while (ops.length > 1 && (nesting * 3 + precedence[token] <= ops.secondTop().nesting * 3 + precedence[ops.secondTop().op])) {
        operands = calculateOperator(ops.popSecond().op, operands);
      }     
    }

    console.log(ops, operands, token);

    while (token.endsWith(')')) { nesting--; token = token.substring(0, token.length - 1); }
    tokenType = (tokenType == 'operand') ? 'operator' : 'operand';
  }

  while (ops.length > 0) operands = calculateOperator(ops.pop().op, operands);
  return operands[0];
}

function calculateOperator(operator, operands) {
  switch (operator) {
    case '+': operands.push(operands.popSecond() + operands.pop()); break;
    case '-': operands.push(operands.popSecond() - operands.pop()); break;
    case '*': operands.push(operands.popSecond() * operands.pop()); break;
    case '/': operands.push(operands.popSecond() / operands.pop()); break;
  }

  return operands;
}
