const { NegativeAmountError, NotEnoughMoneyError, ATM } = require('./models/app');
const { when_given } = require('./bdd').Implementing;

module.exports = class App {

    withdraw_money_from_atm(atm, amount) {
        let result = undefined;

        when_given("a negative amount", amount < 0)
        .then(R=> {
            throw new NegativeAmountError(amount);
        });

        when_given("an amount exceeding the atm's money", amount > atm.money)
        .then(R=> {
            throw new NotEnoughMoneyError(amount, atm.money)
        });

        when_given("a positive amount in range of the atm's money", amount >= 0 && amount <= atm.money)
        .then(R=> {
            atm.money -= amount;
            result = amount;
        });

        return result;
    }

};