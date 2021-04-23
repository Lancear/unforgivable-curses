class NegativeAmountError extends Error {}
class NotEnoughMoneyError extends Error {}
function ATM(money) { this.money = money; }

module.exports = { NegativeAmountError, NotEnoughMoneyError, ATM };