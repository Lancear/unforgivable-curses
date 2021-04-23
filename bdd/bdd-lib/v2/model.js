class NegativeAmountError extends Error {
    constructor(amount) {
        super();
        this.amount = amount;
    }

    toString() {
        return `Negative Amount Error, amount = ${this.amount}`; 
    }
}

class NotEnoughMoneyError extends Error {
    constructor(requested, available) { 
        super();
        this.requested = requested;
        this.available = available;
    }

    toString() {
        return `Not Enough Money Error, requested = ${this.requested}, available = ${this.available}`; 
    }
}

class DisabledCardError extends Error {
    constructor(card) { 
        super();
        this.card = card;
    }

    toString() {
        return `Disabled Card Error, card = ${this.card}`; 
    }
}

class ATM {
    constructor(money) { 
        this.money = money;
    }

    toString() {
        return `new ATM(${this.money})`; 
    }
}

class Card {
    constructor(balance = 0, isDisabled = false) {
        this.balance = balance;
        this.isDisabled = isDisabled;
    }

    toString() {
        return `new Card(${this.balance}, ${this.isDisabled})`; 
    }
}

module.exports = { NegativeAmountError, NotEnoughMoneyError, DisabledCardError, ATM, Card };