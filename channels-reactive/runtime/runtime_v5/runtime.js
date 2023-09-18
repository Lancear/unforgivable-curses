const code = require('./async syntax/code.json');
const library = require('./library.js');
const scopes = [ new Scope(null, library) ];

execute_task(code);

function execute_task(task) {
  if (Array.isArray(task)) {
    execute_instruction(task);
  }
  else {
    const labels = Object.keys(task);

    labels.forEach(label => {
      if (label !== '->') {
        scope().set(label, execute_instruction(task[label]));
      }
      else {
        const tasks = task[label];
        tasks.forEach(task => {
          scopes.push( new Scope(scope()) );
          execute_task(task);
          scopes.pop();
        });
      }
    });
  }
}

function execute_instruction(instruction) {
  if (Array.isArray(instruction)) {
    const instr = evaluate_instruction(instruction);
    const op = instr.shift();
    const args = instr;
    return call_function(op, args);
  }
  else {
    return instruction;
  }
}

function call_function(fn, args) {
  fn = find_function(fn);
  return fn.apply(null, args);
}

function evaluate_instruction(instructions) {
  return instructions.map(instr => {
    if (typeof(instr) == 'string') {
      const regex = /{[a-zA-Z_][a-zA-Z0-9_.!?\-]*}/g;

      if (instr.startsWith('{') && instr.endsWith('}')) {
        return scope().get( instr.substring(1, instr.length - 1) )
      }
      else {
        return instr.replace(regex, (match) => scope().get( match.substring(1, match.length - 1) ));
      }
    }
    else {
      return instr;
    }
  });
}

function find_function(name) {
  if (name.startsWith('#')) {
    switch (name.substring(1)) {
      case 'fn':
        return (params, task) => {
          return (...args) => {
            scopes.push( new Scope(scope()) );
            params.forEach((param, idx) => scope().set(param, args[idx]));
            execute_task(task);

            const result = scope().get('return');
            scopes.pop();
            return result;
          };
        };

      default:
        console.error(name, "is not a valid macro!");
    }
  }
  else {
    return scope().get(name);
  }
}

function Scope(parent, lookup) {
  this.parent = parent || null;
  this.lookup = lookup || {};

  this.set = (key, val) => {
    this.lookup[key] = val;
  };

  this.get = (key) => {
    return (this.lookup[key] !== undefined || parent === null) ? this.lookup[key] : parent.get(key);
  };
}

function scope() {
  return scopes[scopes.length - 1];
}
