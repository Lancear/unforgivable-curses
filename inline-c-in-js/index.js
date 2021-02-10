function INLINE_C(strings, ...jsScope) {
  const vars = new Map();
  const args = [];

  // just a bad idea with a minimal proof of concept
  // totally hardcoded, but could be connected with something like JSCPP
  let code = strings[0];
  let tokens = code.split('"').reduce((tokens, str, idx) => (idx % 2) ? [...tokens, `"${str}"`] : [...tokens, ...str.replace(/([;()=])/g, " $1").split(/[ \t\r\n]/ ).filter(str => str.length > 0)], []);
    
  vars.set(tokens[1], tokens[3].substr(1, tokens[3].length - 2));
  args.push(tokens[7]);

  args.push(jsScope.shift());

  code = strings[1];
  tokens = code.split('"').reduce((tokens, str, idx) => (idx % 2) ? [...tokens, `"${str}"`] : [...tokens, ...str.replace(/([;()=])/g, " $1").split(/[ \t\r\n]/ ).filter(str => str.length > 0)], []);
  
  args.push(tokens[1]);

  console.log(args[0].substr(1, args[0].length - 2).replace('%s', args[1]).replace('%c', vars.get(args[2])));
}



const appName = "wtf";
console.log("js");

INLINE_C `
  char lang = "C";
  printf("Inside %s, someone uses %c :scream:", ${appName}, lang);
`

console.log("back in good old js");
