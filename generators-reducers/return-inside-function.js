function $(generator) {
  return new Proxy(generator, { apply: (target, thisArg, args) => target.apply(thisArg, args).next().value });
}

const div = $(function*(a, b) {
  yield* screwYouZero(b);
  yield a  / b;
});

function* screwYouZero(n) {
  if (n === 0) yield new Error("Screw you zero!!!");
}

console.dir( div(1, 2) );
console.dir( div(1, 0) );
