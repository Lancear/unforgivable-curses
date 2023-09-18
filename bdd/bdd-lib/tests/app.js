const { NegativeAmountError, NotEnoughMoneyError, ATM } = require('../models/app');
const { when, Results } = require('../bdd').Testing;

module.exports = class AppTests {

    static withdraw_money_from_atm(App) {
        const results = new Results();
        const app = new App();
        
        when('withdraw_money_from_atm', app, { heading: true })
        .is_given("a negative amount", { atm: new ATM(200), amount: -12 })
        .then(({ error }) => {
            results.expect("a NegativeAmountError", error instanceof NegativeAmountError);
        });

        when('withdraw_money_from_atm', app)
        .is_given("an amount exceeding the atm's money", { atm: new ATM(200), amount: 1200 })
        .then(({ error }) => {
            results.expect("a NotEnoughMoneyError", error instanceof NotEnoughMoneyError);
        });

        const resultMoney = 150;
        when('withdraw_money_from_atm', app)
        .is_given("a positive amount in range of the atm's money", { atm: new ATM(200), amount: 50 })
        .then(({ result, args: {atm, amount} }) => {
            results.expect("the atm's money to be reduced by the amount", atm.money == resultMoney);
            results.expect("to get the amount from the atm", result == amount);
        });

        results.summarise();
    }

};