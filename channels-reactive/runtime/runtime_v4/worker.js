const process = require('process');
const wt = require('worker_threads');

const data = wt.workerData;
const parent = wt.parentPort;

parent.postMessage("hey from " + data.id);

parent.on('message', (task) => {
  parent.postMessage("received a task: " + JSON.stringify(task));
});