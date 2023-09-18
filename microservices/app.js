const express = require('express');

const { Network, Message, Command, Query, Event, Filter, Adapter, AutoConfigService, Gate } = require('./Network');

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

deploy();
async function deploy() {
  const app = new Network();

  const server = express();
  server.use(express.text());
  server.use(express.json());
  server.listen(8080, $=> console.log("Logger at http://localhost:8080/logger"));

  const logEndpoint = new RestGate(server, '/logger');
  logEndpoint.map_post('/').to_command('log');
  logEndpoint.map_post('/:level').to_command('leveledLog');
  logEndpoint.map_get('/logs').to_query('logs');

  const authFilter = new AuthFilter(new Command('log'));
  const authAdapter = new AuthAdapter(new Command('log'));
  
  app.connect(logEndpoint);
  app.connect(authFilter);
  authFilter.connect(authAdapter);
  authAdapter.connect(new Logger());

  app.connect(new Logger());

  const YAML = require('yaml');
  const fs = require('fs').promises;
  const config = await fs.readFile('./network.json', 'utf8');
  console.log( YAML.stringify(JSON.parse(config)) );
}

