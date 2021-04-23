// pure
const reducer =(state, fn)=> !fn ? state : reducer.bind(null, fn(state));

// pure
const increment =({counter})=> ({counter: counter + 1});

// pure
const decrement =({counter})=> ({counter: counter - 1});

// dirty: IO, no mutation
const log =(state)=> (console.log(state), state);

const startState = {counter: 1};
const finalState = reducer.bind(null, startState)
  (increment)
  (increment)
  (increment)
  (decrement)
  (log)
  (decrement)
  (log)
  (decrement)
  (decrement)
  (decrement)
  ();

console.log('final state:', finalState);
