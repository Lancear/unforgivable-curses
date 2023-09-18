const { NegativeAmountError, NotEnoughMoneyError, DisabledCardError, ATM, Card } = require('./model');
const { given } = require('./BDD');

class App {

    static withdraw_money_from_atm(atm, amount) {
        let result = undefined;

        given("the amount is negative", amount < 0)
        .then(R=> {
            throw new NegativeAmountError(amount);
        });

        given("the amount exceeds the atm's money", amount > atm.money)
        .then(R=> {
            throw new NotEnoughMoneyError(amount, atm.money)
        });

        given("the amount is positive and within range of the atm's money", amount >= 0 && amount <= atm.money)
        .then(R=> {
            atm.money -= amount;
            result = amount;
        });

        return result;
    }

    static transfer_money_at_atm(card, amount, account) {
        let result = undefined;

        given("a disabled card", card.isDisabled)
        .then(R=> {
            throw new DisabledCardError(card);
        });

        given("a negative amount", amount < 0)
        .then(R=> {
            throw new NegativeAmountError(amount);
        });

        given("a valid card with not enough money", !card.isDisabled && card.balance < amount)
        .then(R=> {
            throw new NotEnoughMoneyError(amount, card.balance);
        });
    
        given("a valid card with enough money and a positive amount", !card.isDisabled && amount >= 0 && card.balance >= amount)
        .then(R=> {
            card.balance -= amount;
            account.balance += amount;
        });

        return result;
    }

}

module.exports = App;