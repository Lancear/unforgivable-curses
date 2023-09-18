const colors = require('colors');

function stringify(obj) {
    let stringified = '';

    for(let key in obj) {
        stringified += `, ${key}: ${obj[key]}`;
    }

    return `{ ${stringified.substring(2)} }`;
}

class TestRunner {

    constructor(app) {
        this.app = app;
        this.functionName = undefined;
        this.indent = '';

        this.succeeded = 0;
        this.failed = 0;
    }

    when(functionName) {
        this.functionName = functionName;

        this.indent = '';
        console.log(colors.white(`${this.indent}- WHEN ${functionName}`));
        this.indent += '  ';
    }

    test(spec) {
        if (!this.functionName) throw new Error("testRunner.when has to be called first!");
        if (!spec.given || !spec.like || !spec.then) throw new Error("the spec keywords 'given', 'like', and 'then' are required!");

        console.log(colors.white(`${this.indent}- IS GIVEN ${spec.given}`));
        const undoIndent = this.indent;
        this.indent += '  ';

        for(let idx = 0; idx < spec.like.length; idx++) {
            const args = spec.like[idx];
            const expected = spec.expecting && spec.expecting[idx];            

            console.log(colors.gray(`${this.indent}- ${idx + 1}. Iteration, args: ${stringify(args)}`));
            const undoIndent = this.indent;
            this.indent += '     ';

            try {
                const result = this.app[this.functionName](...Object.values(args));
                spec.then(result, args, expected);
            }
            catch (error) {
                spec.then(error, args, expected);
            }

            this.indent = undoIndent;
        }

        this.indent = undoIndent;
    }

    expect(message, condition) {
        if (condition) {
            this.succeeded++;
            console.log(colors.green(`${this.indent}EXPECT ${message}`));
        }
        else {
            this.failed++;
            console.error(colors.red(`${this.indent}EXPECT ${message} [FAILED]`));
        }
    }

    summarise() {
        const succeeded = this.succeeded;
        const failed = this.failed;
        const total = succeeded + failed;

        console.log('');
        console.log(colors.white('RESULTS'));
        console.log(colors.cyan(`${failed}/${total} tests failed!`));
        console.log(colors.cyan(`${succeeded}/${total} tests succeeded!`));
        console.log(colors.cyan(`FAIL RATE: ${(failed * 100 / total).toFixed(2)}%`));
        console.log('');
    }

}

class Implementing {

    static given(message, condition) {
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

module.exports = { 
    TestRunner: TestRunner, 
    given: Implementing.given 
};