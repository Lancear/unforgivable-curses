const ATM = require('../state');
const { Card } = require('../../domain-model');

/**
 * - As an Account Holder
 * - In order to transfer money between accounts
 * - I want to transfer cash from an ATM 
 * 
 * `The account holder requests to transfer <amount> to <account>`
 * 
 * Guard Scenarios:
 * 1. The card is disabled
 * 2. The amount is negative
 * 3. The account has insufficient funds
 * 
 * Scenarios:
 * 1. The account to transfer the money to is disabled
 * 2. The account has sufficient funds
 *  
 * @param amount {Number} the amount to transfer
 * @param account {Card} the account to transfer to
 */
function transfer_cash(amount, account) {

  //guard (check_card, check_balance);

  // Scenario: The account to transfer the money to is disabled
  if (account.isDisabled) {
    ATM.say('The account you want to transfer to is disabled!');
    ATM.returnCard();
    return;
  }

  // Scenario: the account has sufficient funds
  else {
    ATM.card.balance -= amount;                 // assert: <card.balance == endingCardBalance>
    account.balance += amount;                  // assert: <account.balance == endingAccountBalance>
    ATM.say(amount + ' has been transfered!');
    ATM.returnCard();
    return;
  }

}

module.exports = transfer_cash;