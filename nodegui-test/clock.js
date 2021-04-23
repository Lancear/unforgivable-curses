const parent = require('worker_threads').parentPort;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

loop();
async function loop() {
    let counter = 0;
    while (true) {
        parent.postMessage('seconds since start: ' + (counter++));
        await wait(1000);
    }
}