const { NegativeAmountError, NotEnoughMoneyError, DisabledCardError, ATM, Card } = require('./model');
const { TestRunner } = require('./BDD');

class AppTests {

    static testrunner = null;

    static testAll(app) {
        this.testrunner = new TestRunner(app);
        this.withdraw_money_from_atm(app);
        this.transfer_money_at_atm(app);
        this.testrunner.summarise();
    }

    static withdraw_money_from_atm(app) {
        const runner = this.testrunner || new TestRunner(app);
        runner.when('withdraw_money_from_atm');

        runner.test({
            given: "a negative amount",
            like: [ { atm: new ATM(200), amount: -1 }, { atm: new ATM(200), amount: -73 } ],
            then: (error) => {
                runner.expect("a NegativeAmountError", error instanceof NegativeAmountError);
            }
        });

        runner.test({
            given: "an amount exceeding the atm's money",
            like: [ { atm: new ATM(200), amount: 201 }, { atm: new ATM(200), amount: 467 } ],
            then: (error) => {
                runner.expect("a NotEnoughMoneyError", error instanceof NotEnoughMoneyError);
            }
        });

        runner.test({
            given: "a positive amount within the range of the atm's money",
            like: [ { atm: new ATM(200), amount: 0 }, { atm: new ATM(200), amount: 200 }, { atm: new ATM(200), amount: 39 } ],
            expecting: [ { atmMoney: 200 }, { atmMoney: 0 }, { atmMoney: 161 } ],
            then: (result, state, expected) => {
                runner.expect("the atm's money to be reduced by the amount", state.atm.money == expected.atmMoney);
                runner.expect("to get the amount from the atm", result == state.amount);
            }
        });

        if(!this.testrunner) runner.summarise();
    }

    static transfer_money_at_atm(app) {
        const runner = this.testrunner || new TestRunner(app);
        runner.when('transfer_money_at_atm');

        runner.test({
            given: "a disabled card",
            like: [ { card: new Card(61, true), amount: 10, account: new Card(32) } ],
            then: (error) => {
                runner.expect("a DisabledCardError", error instanceof DisabledCardError);
            }
        });

        runner.test({
            given: "a negative amount",
            like: [ { card: new Card(61), amount: -1, account: new Card(32) }, { card: new Card(61), amount: -13, account: new Card(32) } ],
            then: (error) => {
                runner.expect("a NegativeAmountError", error instanceof NegativeAmountError);
            }
        });

        runner.test({
            given: "a valid card with not enough money",
            like: [ { card: new Card(37), amount: 38, account: new Card(32) }, { card: new Card(61), amount: 482, account: new Card(32) } ],
            then: (error) => {
                runner.expect("a NotEnoughMoneyError", error instanceof NotEnoughMoneyError);
            }
        });

        runner.test({
            given: "a valid card with enough money and a positive amount",
            like: [ 
                { card: new Card(37), amount: 36, account: new Card(32) }, 
                { card: new Card(61), amount: 1, account: new Card(32) }, 
                { card: new Card(61), amount: 27, account: new Card(32) } 
            ],
            expecting: [ { cardBalance: 1, accountBalance: 68 }, { cardBalance: 60, accountBalance: 33 }, { cardBalance: 34, accountBalance: 59 } ],
            then: (result, args, expected) => {
                runner.expect("the balance on the card to be reduced by the amount", args.card.balance == expected.cardBalance);
                runner.expect("the balance on the account to be increased by the amount", args.account.balance == expected.accountBalance);
            }
        });

        if(!this.testrunner) runner.summarise();
    }

}

module.exports = AppTests;