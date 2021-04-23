const state = require('./state');
const { Card } = require('../domain-model');

const check_card = require('./guards/check_card');
const check_balance = require('./guards/check_balance');

const withdraw_cash = require('./actions/withdraw_cash');
const transfer_cash = require('./actions/transfer_cash');

const ATM = {};

ATM.fill = (amount) => {
  state.fill(amount);
};

/**
 * - As an Account Holder
 * - In order to get money when the bank is closed
 * - I want to withdraw cash from an ATM
 * 
 * `The account holder inserts his card <card> 
 *  and requests to withdraw <amount>`
 * 
 * Scenarios:
 * 1. The card is disabled
 * 2. The amount is negative
 * 3. The account has insufficient funds
 * 4. The ATM contains not enough money
 * 5. The account has sufficient funds
 * 
 * @param card {Card} the account holders card
 * @param amount {Number} the amount to withdraw
 */
ATM.withdraw_cash = (card, amount) => {
  
  // Guard: valid card, valid amount, sufficient funds
  if(check_card(card) && check_balance(amount)) {
    withdraw_cash(amount);
  }
  
};

/**
 * - As an Account Holder
 * - In order to transfer money between accounts
 * - I want to transfer cash from an ATM 
 * 
 * `The account holder inserts his card <card> 
 *  and requests to transfer <amount> to <account>`
 * 
 * Scenarios:
 * 1. The card is disabled
 * 2. The amount is negative
 * 3. The account has insufficient funds
 * 4. The account to transfer the money to is disabled
 * 5. The account has sufficient funds
 * 
 * @param card {Card} the account holders card
 * @param amount {Number} the amount to transfer
 * @param account {Card} the account to transfer to
 */
ATM.transfer_cash = (card, amount, account) => {

  // Guard: valid card, valid amount, sufficient funds
  if(check_card(card) && check_balance(amount)) {
    transfer_cash(amount, account);
  }

};


module.exports = ATM;