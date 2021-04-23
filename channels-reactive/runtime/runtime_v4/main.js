const Runtime = require('./runtime.js');
const Task = require('./task.js');

const code = new Task({
  module: 'math', 
  fn: 'add', 
  args: [5, 3],
  reactions: [
    sum => new Task({ module: 'system', fn: 'print', args: ["Sum:", sum] }),
  ]
});

const rt = new Runtime()
  .createWorker()
  .createWorker()
  .addTask(code)
;