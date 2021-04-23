let accountBalance = 100;
let ATM = {
  money: 3500,
  contains: (amount) => this.money > amount,
  dispense: (amount) => this.money -= amount
};
let card = {
  valid: true,
  return: () => true
}

/**
 * In oder to get money when the bank is closed
 * As an Account Holder
 * I want to withdraw cash from an ATM
 */
function account_holder_withdraws_cash(amount) {

  // Rule: on <when-event-specifier>, if <given-condition> is met, execute the <then-block>

  // Guard
  given ((accountBalance >= amount)
  &&  (ATM.contains(amount))
  &&  (card.valid))

  // Subscribe to event
  when (accountHolder.request amount)

  // Event Listener
  then {
    ATM.dispense(amount);
    accountBalance -= amount;
    card.return();
  }
}

function account_holder_transfers_cash() {

}