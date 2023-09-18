function* producer(startValue) {
  let num = startValue;
  while(true) {
    yield num++;
  }
}

function* transformer(source) {
  while(true) {
    yield source.next().value ** 2;
  }
}

function* consumer(source) {
  while(true) {
    console.log( source.next().value );
    yield;
  }
}

let p = producer(1);
let t = transformer(p);
let c = consumer(t);

for(let i = 0; i < 10; i++) {
  c.next();
}

