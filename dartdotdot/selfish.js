export default class SelfishValue {

  constructor(self, value) {
    if (typeof value === 'symbol' || value === null || value === undefined) 
      throw new TypeError(`Null/Undefined/Symbol values cannot be wrapped as a selfish value!`); 

    const wrappedValue = wrapPrimitive(value);

    return new Proxy(wrappedValue, { 
      get: (target, key) => {
        if (key === '$') return self;
        const prop = target[key];
        /* Some methods wont work unless they are bound to the actual value instead of the proxy. */
        return (typeof prop === 'function') ? prop.bind(target) : prop;
      }
    });
  }

}

function wrapPrimitive(primitive) {
  if (typeof primitive === 'boolean') return new Boolean(primitive);
  if (typeof primitive === 'number') return new Number(primitive);
  if (typeof primitive === 'bigint') return new BigInt(primitive);
  if (typeof primitive === 'string') return new String(primitive);
  return primitive; /* not a primitive, therefore it does not need to be wrapped. */
}
