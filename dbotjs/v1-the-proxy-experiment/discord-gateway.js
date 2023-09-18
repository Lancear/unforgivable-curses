const EventEmitter = require('events');
const WebSocket = require('ws');

class DiscordEvent {
  opcode;
  seqNr;
  name;
  data;

  constructor(payload) {
    payload = JSON.parse(payload);
    this.opcode = payload.op;
    this.seqNr = payload.s;
    this.name = payload.t;
    this.data = payload.d;
  }
}

class DiscordGateway extends EventEmitter {
  static #version = 6;
  static #encoding = 'json';
  static #compress = false;

  #gateway;
  #ws;
  #heartbeat;
  #heartbeatAcked = true;
  #lastSeqNr = null;
  #sessionId;
  #token;
  constructor(token) {
    super();
    this.#token = token;
    this.#gateway = `wss://gateway.discord.gg/?v=${DiscordGateway.#version}&encoding=${DiscordGateway.#encoding}${DiscordGateway.#compress ? '&compress=zlib-stream' : ''}`;
  }

  start(resume = false) {
    console.log('Connecting to the discord gateway ...');
    this.#ws = new WebSocket(this.#gateway);
    this.#ws.on('error', $=> {
      this.close();
      setTimeout($=> this.start(), 5000);
    });

    this.#ws.once('message', payload => {
      console.log('Connected to the discord gateway!');
      console.warn(payload);
      const event = new DiscordEvent(payload);
      const interval = event.data.heartbeat_interval;

      this.#sendHeartbeat();
      this.#heartbeat = setInterval(this.#sendHeartbeat, interval);

      (resume) ? this.#resume() : this.#identify();
      this.#ws.on('message', this.#onMessage);
    });
  }

  close() {
    console.log('Closing the connection to the discord gateway!');
    clearInterval(this.#heartbeat);
    this.#ws.close();
    this.#ws = null;
    this.#heartbeatAcked = true;
  }

  #sendHeartbeat =$=> {
    if (!this.#heartbeatAcked) {
      console.error("Connection to the discord gateway lost, heartbeat not acknowledged!");
      this.close();
      setTimeout($=> this.start(), 5000);
      return;
    }

    const heartbeat = JSON.stringify({ op: 1, d: this.#lastSeqNr });
    this.#ws.send(heartbeat);
    this.#heartbeatAcked = false;
  };

  #identify =$=> {
    const properties = { $os: 'linux', $browser: 'dbotjs', $device: 'dbotjs' };
    const payload = JSON.stringify({ op: 2, d: { token: this.#token, properties }});
    this.#lastSeqNr = null;

    console.log('Trying to identify at the discord gateway ...');
    this.#ws.send(payload);
  };

  #resume =$=> {
    console.log('sessionid:', this.#sessionId, '| lastSeqNr:', this.#lastSeqNr);
    if (!this.#sessionId || !this.#lastSeqNr) {
      console.error("No resumable session available for the discord gateway!");
      this.#identify();
      return;
    }

    const payload = JSON.stringify({ op: 6, d: { token: this.#token, session_id: this.#sessionId, seq: this.#lastSeqNr } });
    console.log('Trying to resume the connection to the discord gateway ...');
    this.#ws.send(payload);
    this.#heartbeatAcked = false;
  };

  #onMessage =(payload)=> {
    const event = new DiscordEvent(payload);
    if (event.opcode !== 0 && event.opcode != 11) console.warn(payload);

    if (event.opcode === 11) {
      this.#heartbeatAcked = true;
    }
    else {
      this.#lastSeqNr = event.seqNr;

      if (event.name === 'READY') {
        this.#sessionId = event.data.session_id;
        console.log('Identified at the discord gateway and ready for use!');
        this.emit('ready');
      }
      else if (event.opcode === 7) {
        console.log('Reconnect request received, reconnecting to the discord gateway ...');
        this.close();
        setTimeout($=> this.start(true), 2000);
      }
      else if (event.opcode === 9) {
        console.warn('Connection to the discord gateway lost, session invalidated!');
        this.close();
        setTimeout($=> this.start(event.data), 5000);
      }
      else if (event.opcode === 0) {
        this.emit('discordEvent', event);
      }
      else {
        console.warn('Unhandled message received from the discord gateway!');
        console.dir(event);
      }
    }
  };
}



module.exports = { DiscordEvent, DiscordGateway };
