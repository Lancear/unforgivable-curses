function getTasks(authToken, user, list) {
  console.log(`Getting tasks for ${user}'s ${list} list...`);
  console.log(`Authenticated? ${authToken.length > 1 ? 'yes' : 'no'}`);
}

function renameList(authToken, user, list, newName) {
  console.log(`Renaming ${user}'s ${list} list to ${newName}...`);
  console.log(`Authenticated? ${authToken.length > 1 ? 'yes' : 'no'}`);
}

const myAccount = $({
  authToken: "xcb097/d8", 
  user: "@me",
});

const myTodos = $({
  ...myAccount,
  list: "todo",
});

// v1
getTasks("xcb097/d8", "@me", "todo");

// v2
myAccount.getTasks("todo");

// v3
myTodos.getTasks();
myTodos.renameList("won't do");

// acts like normal aka throws an error
myAccount.notHere();


// this lets objects with > 1 of the named arguments of any
// function in scope call it as if it were an object method






function $(data) {
  return new Proxy(data, {
    get(target, property) {
      if (Reflect.has(target, property)) return Reflect.get(target, property);
      
      try {
        let fn = eval(property);
        const fnCode = fn.toString();
        const args = fnCode
          .substring(
            fnCode.indexOf("(") + 1, 
            fnCode.indexOf(")")
          )
          .split(',')
          .map(a => a.split(':')[0]) //  ts support
          .map(a => a.trim());
    
        if (!Reflect.has(target, args[0])) 
          throw new Error("Not much of a context when no params are here lol!");

        for (const arg of args) {
          if (Reflect.has(target, arg)) {
            fn = fn.bind(null, Reflect.get(target, arg));
          }
          else {
            return fn;
          }
        }

        return fn;
      }
      catch (ex) {
        /* ignore, key is not a function */
      }
    },
  });
}
