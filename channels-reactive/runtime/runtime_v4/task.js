'use strict';

class Task {

  module;
  fn;
  args;
  reactions;

  constructor({module, fn, args, reactions}) {
    this.module = module;
    this.fn = fn;
    this.args = args;
    this.reactions = reactions;
  }

  json() {
    return {
      module: this.module,
      fn: this.fn,
      args: this.args,
    }
  }

  execute(runtime) {
    const module  =   require(this.module);
    const fn      =   module[this.fn];
    const result  =   fn.apply(null, this.args);
    const todos   =   reactions.reduce(todos, reaction => todos.push(...reaction(result)), []);
                      todos.forEach(task => runtime.addTaks(task))
  }
}

module.exports = Task;