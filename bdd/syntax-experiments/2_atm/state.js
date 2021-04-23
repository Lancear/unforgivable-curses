const ATM = {
  money: 3000,
  retainedCards: [],
  
  dispense: (amount) => {
    ATM.money -= amount;
    console.log('ATM dispensed:', amount);
  },
  returnCard: (card) => console.log('ATM returned card:', card),
  retainCard: (card) => ATM.retainedCards.push(card),
  say: (msg) => console.log('ATM said:', msg)
};

function Card(balance = 0, isDisabled = false) {
  this.balance = balance;
  this.isDisabled = isDisabled;
}


module.exports = {
  ATM,
  Card
};