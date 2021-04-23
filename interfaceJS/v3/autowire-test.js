class Autowire {

  /**
   * @param {Function} mainClass 
   */
  static run(mainClass) {
    const mainCode = mainClass.toString();
    const annotation = mainCode.match(/[/][*][*][* \t\r\n]*@autowire [{]([a-zA-Z$_][a-zA-Z0-9$_]*)[}] ([a-zA-Z$_][a-zA-Z0-9$_]*)[* \t\r\n]*[*][/]/);
    const autowired = {
      name: annotation[2],
      type: annotation[1]
    };

    const Type = eval(autowired.type);
    const app = new mainClass(new Type());
    app.main();
  }

}

class App {
  main() {
    throw 'Empty main!';
  }
}

class Logger {

  log(msg) {
    console.log(msg);
  }

  debug(val) {
    console.dir(val);
  }

}

class MyApp extends App {

  /** @autowire {Logger} logger */
  constructor(logger) {
    super();
    this.logger = logger;
  }

  main() {
    this.logger.log("hello world!");
    this.logger.debug({ works: true, how: "autowired!" });
  }

}

Autowire.run(MyApp);
