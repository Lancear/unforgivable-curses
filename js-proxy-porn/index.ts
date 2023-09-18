function getTasks(p: { authToken: string, user: string, list: string }) {
  console.log(`Getting tasks for ${p.user}'s ${p.list} list...`);
  console.log(`Authenticated? ${p.authToken.length > 1 ? "yes" : "no"}`);
}

function renameList(p: { authToken: string, user: string, list: string, newName: string }) {
  console.log(`Renaming ${p.user}'s ${p.list} list to ${p.newName}...`);
  console.log(`Authenticated? ${p.authToken.length > 1 ? "yes" : "no"}`);
}

// this lets objects with > 1 of the named arguments of any
// function in scope call it as if it were an object method
function $<T extends Record<string, any>>(data: T) {
  return new Proxy(data, {
    get(target, property) {
      if (Reflect.has(target, property)) return Reflect.get(target, property);

      try {
        // eslint-disable-next-line no-eval
        if (typeof property !== "string") throw new Error("Not a string");
        if (!(property in globalThis)) throw new Error("Not a function");
        let fn = globalThis[property as keyof typeof globalThis];
        const fnCode = fn.toString();
        const args = fnCode
          .substring(fnCode.indexOf("(") + 1, fnCode.indexOf(")"))
          .split(",")
          .map((a) => a.split(":")[0]) //  ts support
          .map((a) => a.trim());

        if (!Reflect.has(target, args[0])) {
          throw new Error("Not much of a context when no params are here lol!");
        }
        for (const arg of args) {
          if (Reflect.has(target, arg)) {
            fn = fn.bind(null, Reflect.get(target, arg));
          } else {
            return fn;
          }
        }
        return fn;
      } catch (ex) {
        /* ignore, key is not a function */
      }
      return undefined;
    },
  }) as T & { [K in keyof typeof globalThis]: OptionalParamFunction<K, T>
  };
}

type MainParam<K extends keyof typeof globalThis> = Parameters<typeof globalThis[K]>[0];
type MergedParam<K extends keyof typeof globalThis, T> = Pick<MainParam<K>, Exclude<keyof MainParam<K>, keyof T>>
type OptionalParamFunction<K extends keyof typeof globalThis, T> = {} extends MergedParam<K, T> ? () => ReturnType<typeof globalThis[K]> : (p: MergedParam<K, T>) => ReturnType<typeof globalThis[K]>;

const account = {
  authToken: "xcb097/d8",
  user: "@me",
}

const myAccount = $(account);
const myTodos = $({
  ...account,
  list: "todo",
});
// v1
getTasks({ authToken: "xcb097/d8", user: "@me", list: "todo" });
// v2
myAccount.getTasks({ list: "todo" });
// v3
myTodos.getTasks();
myTodos.renameList({ newName: "won't do" });
