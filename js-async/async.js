console.log("[0] Executing file / global scope...");
queueMicrotask(() => {
  console.log("[1] Executing Microtasks...");
  queueMicrotask(() => {
    console.log("[2] Executing newly added Microtasks...");
    queueMicrotask(() => {
      console.log("[3] Executing newly added Microtasks...");
      queueMicrotask(() => {
        console.log("[4] Executing newly added Microtasks...");
        queueMicrotask(() => {
          console.log("[5] Executing newly added Microtasks...");
        });
      });
    });
  });
});



// v1, ? = 1
// main();
// function main() {
//   console.log("[0] Executing main function...");
//   Promise.resolve("[?] Executing Promise-Then-Microtask...").then(console.log);
//   console.log("[0] Finishing main function...");
// }



// v2, ? = 1
// syntax does not allow for 'Finishing main function...' log
// main();
// async function main() {
//   console.log("[0] Executing main function...");
//   console.log(await Promise.resolve("[?] Executing Promise-Await-Microtask..."));
// }



// v3, ? = 1
// Promise = class extends Promise {};
// main();
// function main() {
//   console.log("[0] Executing main function...");
//   Promise.resolve("[?] Executing Promise-Then-Microtask...").then(console.log).then(setInterval(() => {}, 10_000));
//   console.log("[0] Finishing main function...");
// }



// v4, ? = 3
// syntax does not allow for 'Finishing main function...' log
Promise = class extends Promise {};
main();
async function main() {
  console.log("[0] Executing main function...");
  console.log(await Promise.resolve("[?] Executing Promise-Await-Microtask..."));
}


// v4 with additional logging
// syntax does not allow for 'Finishing main function...' log
// All the additional code for logging has the same effect on the execution time as in the original v4.
// Promise = class extends Promise {
//   // ? = 0 like expected
//   static resolve(...args) { 
//     console.log("[?] Executing extended Promise.resolve...");
//     const result = super.resolve(...args);
//     console.log("[?] Finishing extended Promise.resolve...");
//     return result;
//   }

//   // ? = 1 like in all other versions
//   then(...args) {
//     console.log("[?] Executing extended Promise.then...");
//     const result = super.then(...args);
//     console.log("[?] Finishing extended Promise.then...");
//     return result;
//   }
// };

// main();
// async function main() {
//   console.log("[0] Executing main function...");
//   const promise = Promise.resolve("[?] Executing Promise-Microtask...");
//   promise.then(() => console.log("[?] Executing Promise-Then-Microtask...")); // ? = 1

//   await promise;
//   console.log("[?] Executing Promise-Await-Microtask..."); // ? = 3
// }



// v5, ? queues a task?
// bluebird does i dont know what lol
// Promise = require("bluebird");
// main();
// async function main() {
//   console.log("[0] Executing main function...");
//   console.log(await Promise.resolve("[?] Executing Promise-Await-Microtask..."));
// }



// v6, ? = 1
// Promise = require("bluebird");
// main();
// function main() {
//   console.log("[0] Executing main function...");
//   Promise.resolve("[?] Executing Promise-Then-Microtask...").then(console.log);
//   console.log("[0] Finishing main function...");
// }





// experiment 1, ? = 1
// main();
// async function main() {
//   const x = await { then: "[?] Executing Value-Await-Microtask..." };
//   console.log(x.then);
// }



// experiment 2, ? = 2
// Executing a non-promise thenable takes 1 cycle of Microtasks longer?
// main();
// async function main() {
//   const objectWithThen = {
//     then(fn) {
//       console.log("[?] Executing Thenable.then...");
//       fn("[?] Executing Thenable-Await-Microtask...");
//     }
//   };

//   const x = await objectWithThen;
//   console.log(x);
// }



// experiment 3, ? = 1
// The then function is NOT called for promises while using await
// main();
// async function main() {
//   const promise = Promise.resolve("[?] Executing Promise-Await-Microtask...");
//   promise.then =(fn)=> console.log("not called?");
//   const x = await promise;
//   console.log(x);
// }



// experiment 4, ? = 3
// main();
// async function main() { 
//   const promise = Promise.resolve("[?] Executing Promise-inside-Thenable-Await-Microtask...");

//   let x = await {
//     then(fn) {
//       console.log("[?] Executing Thenable.then...");
//       promise.then(fn);
//     }
//   };

//   console.log(x);
// }



// experiment 5, ? = 4
// Await resolves nested promises
// main();
// async function main() { 
//   let x = await {
//     then(fn) {
//       console.log("[?] Executing ObjectWithThen-Await-Microtask...");
//       fn(new Promise((res) => res(5)));
//     }
//   };

//   console.log(x);
// }




// experiment 6, ? = 1
// Promise.resolve resolves the value first when it is a promise
// main();
// function main() { 
//   Promise.resolve(new Promise((res) => res("[?] Executing Promise-PromiseResolve-Microtask..."))).then(console.log);  
// }



// experiment 7, ? = 2
// Promise.resolve resolves the value first when it is a thenable
// main();
// function main() { 
//   Promise.resolve({ then(fn) { fn("[?] Executing Thenable-PromiseResolve-Microtask...") }}).then(console.log);  
// }



// experiment 8, ? = 3
// Promise.resolve resolves the value first when it is a thenable till it is a non-thenable
// main();
// function main() { 
//   Promise.resolve({ then(fn) { fn({ then(fn) { fn("[?] Executing Nested-Thenable-PromiseResolve-Microtask...") }}) }}).then(console.log);  
// }



// experiment 9, ? = 3
// thenable gets an anonymous native function instead of console.log
// this native function must add the unpredicted additional 1 Microtask delay
// main();
// function main() { 
//   const promise = Promise.resolve("[?] Executing Promise-inside-Thenable-PromiseResolve-Microtask...");
//   promise._then = promise.then;
//   promise.then =(fn)=> {
//     console.log("[?] Executing Promise.then...");
//     console.dir(fn);
//     console.dir(fn.toString());
//     promise._then(fn);
//   };

//   Promise.resolve({
//     then(fn) {
//       console.log("[?] Executing Thenable.then...");
//       console.dir(fn);
//       console.dir(fn.toString());
//       promise.then(fn);
//     }
//   }).then(console.log);
// }


// experiment 10
// The then function IS called for promises while using promise.resolve
// main();
// async function main() {
//   const promise = Promise.resolve("[?] Executing Promise-Await-Microtask...");
//   promise.then =(fn)=> console.log("not called?");
//   Promise.resolve(promise).then(console.log);
// }



// experiment 11, ? = 1
// promise.then receives the console.log function
// main();
// function main() { 
//   const promise = Promise.resolve("[?] Executing Promise-PromiseResolve-Microtask...");
//   promise._then = promise.then;
//   promise.then =(fn)=> {
//     console.log("[?] Executing Promise.then...");
//     console.dir(fn);
//     console.dir(fn.toString());
//     promise._then(fn);
//   };

//   Promise.resolve(promise).then(console.log);
// }



// experiment 12
// promise.resolve simply returns the value when it is a promise
// main();
// function main() { 
//   const promise = Promise.resolve("[?] Executing Promise-PromiseResolve-Microtask...");
//   const promiseResolved = Promise.resolve(promise);
//   console.log(promise === promiseResolved);
// }





// await performs promise.resolve and then performs promise.then on the result of promise.resolve
// performs NOT calls





// unexpected execution order examples:

// simplified
// class CustomPromise extends Promise { /* custom code which does not affect the results */ };

// const realPromise = new Promise(res => res("real promise"));
// const fakePromise = new CustomPromise((res) => res("custom promise"));
// const obj = { hello: 'world', greet() {console.log("greet")}, then(x) {x("then")}};
// const num = 7;

// Promise.resolve(fakePromise).then(console.log);
// Promise.resolve(obj).then(console.log);
// Promise.resolve(realPromise).then(console.log);
// Promise.resolve(num).then(console.log);



// more realistic
// class CustomPromise extends Promise { /* custom code which does not affect the results */ };

// const realPromise = new Promise(res => res("real promise 1"));
// const realPromise2 = new Promise(res => res("real promise 2"));
// const fakePromise = new CustomPromise((res) => res("custom promise"));

// Promise.resolve('x').then(async x => await fakePromise).then(console.log);
// Promise.resolve('x').then(async x => await realPromise).then(console.log);
// Promise.resolve('x').then(async x => await realPromise2).then(console.log);



console.log("[0] Finishing file / global scope...");
