Object.copy =(obj)=> {
  return JSON.parse( JSON.stringify(obj) );
};

class Message {

  constructor(name, payload = undefined) {
    this.name = name;
    this.payload = payload;
  }

}

class Command extends Message {

  #response;
  #promise;
  #resolve;

  constructor(name, payload = {}) {
    super(name, payload);
    this.#promise = new Promise((res, rej) => this.#resolve = res);
  }

  reply(payload) {
    const response = new Event(`${this.name}-reply`, payload);
    this.#response = response;
    this.#resolve(response);
  }

  /**
   * @returns {Promise<Message>}
   */
  async await() {
    return this.#response ?? this.#promise;
  }

}

class Query extends Message {

  #response;
  #promise;
  #resolve;

  constructor(name, payload = {}) {
    super(name, payload);
    this.#promise = new Promise((res, rej) => this.#resolve = res);
  }

  reply(payload) {
    const response = new Event(`${this.name}-reply`, payload);
    this.#response = response;
    this.#resolve(response);
  }

  /**
   * @returns {Promise<Message>}
   */
  async await() {
    return this.#response ?? this.#promise;
  }

}

class Event extends Message {

}

class NetworkNode {

  offers = [];
  uses = [];

  /**
   * @type {Network}
   */
  connectedNetwork = null;

  /**
   * @param {Message} message 
   */
  offer(message) {
    this.offers.push(message);
  }

  /**
   * @param {Message} message 
   */
  use(message) {
    this.uses.push(message);
  }

}

class Service extends NetworkNode {

}

class AutoConfigService extends Service {

  constructor() {
    super();

    Object
      .getOwnPropertyNames(new.target.prototype)
      .filter(property => property !== 'constructor')
      .forEach(property => {        
        if (property.startsWith('get_') || property.startsWith('list_')) this.offer(new Query(property.replace('get_', '').replace('list_', '')));
        else this.offer(new Command(property));
      });
  }

}

class Gate extends Service {

}

class Network extends NetworkNode {

  actions = {
    commands: new Map(),
    queries: new Map()
  };

  /**
   * @param {NetworkNode} node 
   */
  connect(node) {
    node.uses.forEach(message => {
      if (message instanceof Command) {
        const messageHandlers = this.actions.commands.get(message.name) ?? { filters: [], adapters: [], endpoints: [] };
        if (node instanceof Filter)  messageHandlers.filters.push(node);
        else if (node instanceof Adapter)  messageHandlers.adapters.push(node);
        this.actions.commands.set(message.name, messageHandlers);
      }
      else if (message instanceof Query) {
        const messageHandlers = this.actions.queries.get(message.name) ?? { filters: [], adapters: [], endpoints: [] };
        if (node instanceof Filter)  messageHandlers.filters.push(node);
        else if (node instanceof Adapter)  messageHandlers.adapters.push(node);
        this.actions.queries.set(message.name, messageHandlers);
      } 
    });

    node.offers.forEach(message => {
      if (message instanceof Command) {
        const messageHandlers = this.actions.commands.get(message.name) ?? { filters: [], adapters: [], endpoints: [] };
        if (node instanceof Service)  messageHandlers.endpoints.push(node);
        this.actions.commands.set(message.name, messageHandlers);
      }
      else if (message instanceof Query) {
        const messageHandlers = this.actions.queries.get(message.name) ?? { filters: [], adapters: [], endpoints: [] };
        if (node instanceof Service)  messageHandlers.endpoints.push(node);
        this.actions.queries.set(message.name, messageHandlers);
      } 
    });

    node.connectedNetwork = this;
  }

  command(name, payload) {
    const command = new Command(name, payload);
    const messageHandlers = this.actions.commands.get(command.name);

    this.#run(async $=> {
      for (let filter of messageHandlers.filters) {
        if (filter.filter(command.payload)) {
          const result = await filter.command(command.name, command.payload);
          if (result.payload) return command.reply(result.payload);
        }
      }

      for (let adapter of messageHandlers.adapters) {
        const mappedCommand = adapter.map(Object.copy(command));
        const result = await adapter.command(mappedCommand.name, mappedCommand.payload);
        if (result.payload) return command.reply(result.payload);
      }

      for (let endpoint of messageHandlers.endpoints) {
        const result = await endpoint[command.name](command.payload);
        if (result) return command.reply(result);
      }

      command.reply();
    });

    return command.await();
  }

  query(name, payload) {
    const query = new Query(name, payload);
    const messageHandlers = this.actions.queries.get(query.name);
    
    this.#run(async $=> {
      for (let filter of messageHandlers.filters) {
        if (filter.filter(query.payload)) {
          const result = await filter.query(query.name, query.payload);
          if (result.payload) return query.reply(result.payload);
        }
      }

      for (let adapter of messageHandlers.adapters) {
        const mappedQuery = adapter.map(Object.copy(query));
        const result = await adapter.command(mappedQuery.name, mappedQuery.payload);
        if (result.payload) return query.reply(result.payload);
      }

      for (let endpoint of messageHandlers.endpoints) {
        const result = await endpoint[`get_${query.name}`](query.payload);
        if (result) return query.reply(result);
      }

      query.reply();
    });

    return query.await();
  }

  event(name, payload) {
    
  }

  async #run(fn) {
    fn();
  }

}

class Filter extends Network {

  /**
   * @param  {...Message} filteredMessages 
   */
  constructor(...filteredMessages) {
    super();
    filteredMessages.forEach(message => this.use(message));
  }

}

class Adapter extends Network {

  /**
   * @param  {...Message} mappedMessaged 
   */
  constructor(...mappedMessaged) {
    super();
    mappedMessaged.forEach(message => this.use(message));
  }

}


module.exports = { Message, Command, Query, Event, NetworkNode, Network, Filter, Adapter, Service, AutoConfigService, Gate };
