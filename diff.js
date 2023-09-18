function diff(a, b) {
  let smallSeen = [];
  let bigSeen = [];
  const wordsSeen = new Set();
  const diff = [];

  const [small, big, smallOp, bigOp] = a.length < b.length
    ? [a, b, "-", "+"]
    : [b, a, "+", "-"];

  for (let idx = 0; idx < big.length; idx++) {
    if (idx < small.length) {

      if (!wordsSeen.has(small[idx])) {
        wordsSeen.add(small[idx]);
        smallSeen.push(small[idx]);
      }
      else {
        console.log("small", small[idx]);
        console.dir(wordsSeen);
        console.dir(smallSeen);
        console.dir(bigSeen);

        const bigSeenDiff = bigSeen.splice(0, bigSeen.indexOf(small[idx]));

        for (const w of [...bigSeenDiff, ...smallSeen, small[idx]]) wordsSeen.delete(w);

        diff.push(...bigSeenDiff.map(s => `${bigOp} ${s}`));
        diff.push(...smallSeen.map(s => `${smallOp} ${s}`));
        smallSeen = [];
        bigSeen.shift();

        console.dir(wordsSeen);
        console.dir(smallSeen);
        console.dir(bigSeen);
      }
    }


    if (!wordsSeen.has(big[idx])) {
      wordsSeen.add(big[idx]);
      bigSeen.push(big[idx]);
    }
    else {
      console.log("big", big[idx]);
      console.dir(wordsSeen);
      console.dir(smallSeen);
      console.dir(bigSeen);

      const smallSeenDiff = smallSeen.splice(0, smallSeen.indexOf(big[idx]));

      for (const w of [...smallSeenDiff, ...bigSeen, big[idx]]) wordsSeen.delete(w);

      diff.push(...bigSeen.map(s => `${bigOp} ${s}`));
      diff.push(...smallSeenDiff.map(s => `${smallOp} ${s}`));
      bigSeen = [];
      smallSeen.shift();

      console.dir(wordsSeen);
      console.dir(smallSeen);
      console.dir(bigSeen);
    }
  }

  return diff.concat(bigSeen.map(s => `${bigOp} ${s}`), smallSeen.map(s => `${smallOp} ${s}`));
}

// console.dir(diff(["a", "b", "c", "d", "e"], ["c", "d", "f"]));
console.dir(diff(["a", "b", "c", "d", "e"], ["c", "a", "b", "d", "f"]));
