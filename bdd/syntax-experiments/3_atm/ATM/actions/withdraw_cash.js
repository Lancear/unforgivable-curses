const ATM = require('../state');
const { Card } = require('../../domain-model');

/**
 * - As an Account Holder
 * - In order to get money when the bank is closed
 * - I want to withdraw cash from an ATM
 * 
 * `The account holder requests to withdraw <amount>`
 * 
 * Guard Scenarios:
 * 1. The card is disabled
 * 2. The amount is negative
 * 3. The account has insufficient funds
 * 
 * Scenarios:
 * 1. The ATM contains not enough money
 * 2. The account has sufficient funds
 * 
 * @param amount {Number} the amount to withdraw
 */
function withdraw_cash(amount) {

  // Scenario: the ATM contains not enough money
  if (ATM.money < amount) {
    ATM.say('The ATM contains not enough money!');
    ATM.returnCard();
    return;
  }

  // Scenario: the account has sufficient funds
  else {
    ATM.dispense(amount);         // assert: <#result == amount>
    ATM.card.balance -= amount;   // assert: <card.balance == endingBalance>
    ATM.returnCard();
    return;
  }

}


module.exports = withdraw_cash;