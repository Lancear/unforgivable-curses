class Testing {

    static when(fnName, app, options = {}) {
        if (options.heading) console.log('%c- WHEN: ' + fnName, 'color: white');
        return { is_given: (...args) => Testing.is_given(fnName, app, ...args) }
    }

    static is_given(fnName, app, message, args) {
        console.log('  - IS GIVEN: ' + message);
        const argsBefore = JSON.parse(JSON.stringify(args));
        const argValues = (Array.isArray(args)) ? args : Object.values(args);
        let result = undefined;
        let error = undefined;
    
        try {
            result = app[fnName](...argValues);
        }
        catch (err) {
            error = err;
        }
    
        return { then: (cb) => Testing.then(fnName, app, error, result, args, argsBefore, cb) };
    }

    static then(fnName, app, error, result, args, argsBefore, cb) {
        cb({ error, result, args, argsBefore });
        return { is_given: (...args) => Testing.is_given(fnName, app, ...args) }
    }

    static Results = class Results {

        success = 0;
        failed = 0;
    
        expect(message, condition) {
            if (condition) {
                console.log('%c      EXPECT ' + message, 'color: green');
                this.success++;
            }
            else {
                console.log('%c      EXPECT ' + message + ' [FAILED]', 'color: red');
                this.failed++;
            }
        }
    
        summarise() {
            const total = this.success + this.failed;
            console.log('');
            console.log('%c= RESULTS ============', 'color: white');
            console.log(`%c- ${this.success}/${total} tests succeeded!`, 'color: blue');
            console.log(`%c- ${this.failed}/${total} tests failed!`, 'color: blue');
            console.log(`%c- fail rate: ${(this.failed * 100 / total).toFixed(0)}%`, 'color: blue');
            console.log('');
        }
    
    }
}

class Implementing {

    static when_given(message, condition) {
        if (condition) {
            return { then: Implementing.then };
        }
        else {
            return { then: () => {} };
        }
    }

    static then(cb) {
        return cb();
    }

}

module.exports = { Testing, Implementing };