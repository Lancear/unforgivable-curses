const ATM = require('../state');
const { Card } = require('../../domain-model');

/**
 * - As an account holder
 * - In order to transfer or withdraw money
 * - I want to insert a card into the ATM
 * 
 * `The account holder inserts his card <card>`
 * 
 * Scenarios:
 * 1. The card is disabled
 * 2. The card is valid
 * 
 * @param card {Card}
 * @returns {Boolean} true when the card is valid
 */
function check_card(card) {

  // Scenario: The card is disabled
  if (card.isDisabled) {
    ATM.retainCard(card);
    ATM.say('Your card has been retained!');
    return false;
  }

  // Scenario: The card is valid
  else {
    ATM.insertCard(card);
    return true;
  }
  
}


module.exports = check_card;