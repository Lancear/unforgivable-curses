const ATM = require('../state');
const { Card } = require('../../domain-model');

/**
 * - As the ATM
 * - In order to withdraw or transfer money
 * - I want to check if the account holder has sufficient funds
 * 
 * `The ATM checks if the account holder has sufficient funds <amount>`
 * 
 * Scenarios:
 * 1. The amount is negative
 * 2. The account has insufficient funds
 * 3. The account has sufficient funds
 * 
 * @param amount {Number} the amount the account holder wants to withdraw or transfer
 * @returns {Boolean} true when the account has sufficient funds
 */
function check_balance(amount) {
  // Scenario: the amount is negative
  if (amount < 0) {
    ATM.say('Cannot withdraw a negative amount!');
    ATM.returnCard();
    return false;
  }

  // Scenario: the account has insufficient funds
  if (ATM.card.balance < amount) {
    ATM.say('There are insufficient funds!');
    ATM.returnCard();
    return false;
  }

  // Scenario: the account has sufficient funds
  else {
    return true;
  }

}


module.exports = check_balance;