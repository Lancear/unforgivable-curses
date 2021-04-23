const { ATM, Card } = require('../state');

/**
 * - As an Account Holder
 * - In order to get money when the bank is closed
 * - I want to withdraw cash from an ATM
 * 
 * `The account holder requests to withdraw <amount>`
 * 
 * Scenarios:
 * 1. the card has been disabled
 * 2. the amount is negative
 * 3. the account has insufficient funds
 * 4. the ATM contains not enough money
 * 5. the account has sufficient funds
 * 
 * @param card {Card} the card of the account holder
 * @param amount {Number} the amount to withdraw
 */
function withdraw_cash(card, amount) {

  // Scenario: the card has been disabled
  if (card.isDisabled) {
    ATM.say('The card has been retained!');
    ATM.retainCard(card);
    return;
  }

  // Scenario: the amount is negative
  if (amount < 0) {
    ATM.say('Cannot withdraw a negative amount!');
    ATM.returnCard(card);
    return;
  }

  // Scenario: the account has insufficient funds
  if (card.balance < amount) {
    ATM.say('There are insufficient funds!');
    ATM.returnCard(card);
    return;
  }

  // Scenario: the ATM contains not enough money
  if (ATM.money < amount) {
    ATM.say('The ATM contains not enough money!');
    ATM.returnCard(card);
    return;
  }

  // Scenario: the account has sufficient funds
  else {
    ATM.dispense(amount);     // assert: <#result == amount>
    card.balance -= amount;   // assert: <card.balance == endingBalance>
    ATM.returnCard(card);
    return;
  }

}

module.exports = withdraw_cash;