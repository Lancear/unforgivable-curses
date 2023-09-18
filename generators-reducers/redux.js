class Redux {

  static GET_STATE = Symbol('GET_STATE');
  static SUBSCRIBE = Symbol('SUBSCRIBE');
  static USE_MIDDLEWARE = Symbol('USE_MIDDLEWARE');

  /**
   * Creates a new Reducer-Store
   */
  static createStore(initialState) {
    const reducer =(redux, state, action)=> {
      // Get State
      if (!action || action.reduxAction === this.GET_STATE) 
        return state;

      // Subscribe
      if (action.reduxAction === this.SUBSCRIBE) 
        return reducer.bind(null, {...redux, subs: [...redux.subs, action.fn]}, state);

      // Use Middleware
      if (action.reduxAction === Redux.USE_MIDDLEWARE)
        return reducer.bind(null, {...redux, uses: [...redux.uses, action.fn]}, state);

      // Apply Action
      const fn = redux.uses.reduce((action, middleware) => middleware(action), action);
      const newState = fn(state);
      redux.subs.forEach(sub => sub(newState));
      return reducer.bind(null, redux, newState);
    };

    // Start the reducer
    return reducer.bind(null, {subs: [], uses: []}, initialState);
  }

  /**
   * @returns an action for returning the state of the reducer
   */
  static getState() {
    return { reduxAction: this.GET_STATE };
  }

  /**
   * @param {Function} fn the handler to call when the state is updated 
   * @returns an action for subscribing to the state of the reducer
   */
  static subscribe(fn) {
    return { reduxAction: this.SUBSCRIBE, fn };
  }

  /**
   * @param {Function} fn the middleware to add
   * @returns an action for adding a middleware to the reducer
   */
  static use(fn) {
    return { reduxAction: this.USE_MIDDLEWARE, fn };
  }

  /**
   * Applies all actions to the store
   * @returns the store with all actions applied
   */
  static apply(store, actions) {
    return actions.reduce((store, action) => store(action), store);
  }

}

const inc =(num)=> num + 1;
const dec =(num)=> num - 1;
const log =(state)=> (console.log(state), state);

const store = Redux.createStore(12);
const val = Redux.apply(store, [
  inc, 
  inc, 
  log, 
  Redux.subscribe(console.log),
  dec,
  dec,
  Redux.use(action => (typeof action === 'number')
    ? (state) => state + action
    : action
  ),
])(10)(-5)();

console.log('result:', val);
