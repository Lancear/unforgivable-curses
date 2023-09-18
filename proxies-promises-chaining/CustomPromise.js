class CustomPromise {

    fn;
    value;
    state = 'pending';
    thens = [];

    constructor(fn, chained = false) {
        this.fn = fn;
        if (!chained) queueMicrotask($ => this.fn(this.#resolve));
    }

    static resolve(value) {
        return new CustomPromise(resolve => resolve(value));
    }

    then(fn) {
        console.log("then");
        const chainedPromise = new CustomPromise(fn, true);

        if (this.state === 'pending') {
            this.thens.push(chainedPromise);
        }
        else if (this.state === 'resolved') {
            queueMicrotask($=> chainedPromise.#resolveWith(this.value));
        }
        
        return chainedPromise;
    }

    #resolve = value => {
        this.value = value;
        this.state = 'resolved';

        for (const promise of this.thens) {
            promise.#resolveWith(this.value);
        }
    };

    #resolveWith = value => {
        this.#resolve( this.fn(value) );
    }

}

class LoggedPromise extends Promise {
    then(...args) {
        console.log("then");
        return super.then(...args);
    }
}

main();
function main() {
    let p = new LoggedPromise(res => setTimeout($=> res("a value"), 1000));
    p.then($=> {
        console.log("resolved!")
        queueMicrotask($=> console.log("Last!"))
    });
    console.log('Before!');

    queueMicrotask($=> {
        p.then(y => {
            console.log(y);
            console.log('After!');
        });
    });
}

setInterval($=>{}, 10_000);
