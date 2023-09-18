const { Command, Query, Filter, Adapter, AutoConfigService, Gate } = require('./Network');

class RestGate extends Gate {

  constructor(server, baseUrl = '') {
    super();
    this.server = server;
    this.baseUrl = baseUrl;
  }

  map_get(url) {
    return {
      to_query: (messageName) => {
        this.use(new Query(messageName));

        this.server.get(this.baseUrl + url, async (req, res) => {
          const headerInfo = {};
          if (req.headers.authorization) headerInfo.authorization = req.headers.authorization;

          const result = await this.connectedNetwork.query(messageName, {...req.params, ...headerInfo, query: req.query});
          res.json(result.payload);
        });
      }
    };
  }

  map_post(url) {
    return {
      to_command: (messageName) => {
        this.use(new Command(messageName));

        this.server.post(this.baseUrl + url, async (req, res) => { 
          const headerInfo = {};
          if (req.headers.authorization) headerInfo.authorization = req.headers.authorization
    
          const result = await this.connectedNetwork.command(messageName, {...req.params, ...headerInfo, data: req.body});
          res.json(result.payload);
        });
      }
    };  
  }

}

class AuthFilter extends Filter {
  
  filter(messagePayload) {
    return messagePayload.authorization;
  }

}

class AuthAdapter extends Adapter {

  map(message) {
    message.payload.authorization = message.payload.authorization.split(' ')[1];
    return message;
  }

}

class Logger extends AutoConfigService {

  logs = [];

  log({ authorization, data }) {
    this.logs.push(data); 
    console.log(`[${authorization ? `AUTH-LOGGER (${authorization})`: 'LOGGER'}] ${data}`);
  }

  leveledLog({ level, data }) {
    this.logs.push(data); 
    console.log(`[${level.toUpperCase()}] ${data}`);
    return "logged!";
  }

  get_logs() {
    return this.logs;
  }

}



module.exports = {RestGate, AuthFilter, AuthAdapter, Logger};
