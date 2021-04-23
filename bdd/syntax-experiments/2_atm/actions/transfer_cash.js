const { ATM, Card } = require('../state');

/**
 * - As an Account Holder
 * - In order to transfer money between accounts
 * - I want to transfer cash from an ATM 
 * 
 * `the account holder transfers <amount> to <account>`
 * 
 * Scenarios:
 * 1. the card has been disabled
 * 2. the amount is negative
 * 3. the account has insufficient funds
 * 4. the account has sufficient funds
 *  
 * @param card {Card} the card of the account holder
 * @param amount {Number} the amount to transfer
 * @param account {Card} the account to transfer to
 */
function transfer_cash(card, amount, account) {

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

  // Scenario: the account has sufficient funds for transferring cash
  else {
    card.balance -= amount;       // assert: <card.balance == endingCardBalance>
    account.balance += amount;    // assert: <account.balance == endingAccountBalance>
    ATM.say(amount + ' has been transfered!');
    ATM.returnCard(card);
    return;
  }

}

module.exports = transfer_cash;