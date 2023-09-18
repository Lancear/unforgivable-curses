const ATM = {
  money: 0,
  card: null,
  retainedCards: [],

  say: (msg) => console.log(msg),
  fill: (amount) => ATM.money += amount,
  insertCard: (card) => ATM.card = card,
  retainCard: (card) => ATM.retainedCards.push(card),
  dispense: (amount) => {
    ATM.money -= amount;
    console.log('- disposed: ' + amount);
  },
  returnCard: () => {
    const card = ATM.card;
    ATM.card = null;
    return card;
  }
};

module.exports = ATM;