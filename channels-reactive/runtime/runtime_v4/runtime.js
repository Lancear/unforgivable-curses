'use strict';

const { Worker } = require('worker_threads');

class Runtime {

  tasks = {
    ready: [],
    delayed: [],
    nextCycle: [],
  };

  workers = {
    idle: [],
    busy: [],
  };

  createWorker() {
    const workerData = {
      id: this.workers.idle.length + this.workers.busy.length
    };

    const worker = new Worker('./worker.js', { workerData });
    worker.on('message', console.log);
    worker.on('exit', console.log.bind(null, "bye from"));

    this.workers.idle.push(worker);
    return this;
  }

  addTask(task) {
    this.tasks.ready.push(task);

    if (this.workers.idle.length > 0) {
      console.log('lolz');
      const worker = this.workers.idle.shift();
      worker.postMessage(task.json());
      this.workers.busy.push({ worker, task });
    }
  }
}

module.exports = Runtime;
