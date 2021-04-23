const { ATM, Card } = require('./state');
const Actions = require('./actions/actions');

ATM.money = 50;
const invalidCard = new Card(300, true);
const validCardWithNotEnoughMoney = new Card(10);
const validCardWithMoney = new Card(100);


// some tests:
console.log('@ Withdraw cash:');
Actions.withdraw_cash(validCardWithMoney, 30);
console.log('endingBalance (should be 70):', validCardWithMoney.balance);
console.log('---');

console.log('@ Withdraw cash:');
Actions.withdraw_cash(validCardWithMoney, -20);
console.log('endingBalance (should be 70):', validCardWithMoney.balance);
console.log('---');

console.log('@ Withdraw cash:');
Actions.withdraw_cash(validCardWithNotEnoughMoney, 30);
console.log('endingBalance (should be 10):', validCardWithNotEnoughMoney.balance);
console.log('---');

console.log('@ Withdraw cash:');
Actions.withdraw_cash(invalidCard, 30);
console.log('endingBalance (should be 300):', invalidCard.balance);
console.log('---');

console.log('@ Transfer cash:');
Actions.transfer_cash(validCardWithMoney, 50, validCardWithNotEnoughMoney);
console.log('endingCardBalance (should be 20):', validCardWithMoney.balance);
console.log('endingAccountBalance (should be 60):', validCardWithNotEnoughMoney.balance);
console.log('---');

console.log('@ Withdraw cash:');
Actions.withdraw_cash(validCardWithNotEnoughMoney, 30);
console.log('endingBalance (should be 60):', validCardWithNotEnoughMoney.balance);
console.log('---');