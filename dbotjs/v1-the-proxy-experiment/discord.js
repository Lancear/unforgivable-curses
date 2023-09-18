const EventEmitter = require('events');

const { DiscordGateway } = require('./discord-gateway');
const { DiscordApi } = require('./discord-api');
const { DiscordGuilds, DiscordGuild, LazyDiscordGuild, DiscordChannels, DiscordChannel, LazyDiscordChannel, DiscordMessage, DiscordMessageType, DiscordMessageEmbed } = require('./discord-data');

class DiscordBot extends EventEmitter {

  guilds;
  channels;
  api;

  #token;
  #gateway;
  
  constructor(token) {
    super();
    this.#token = token;
  }

  start() {
    this.guilds = new DiscordGuilds(this);
    this.channels = new DiscordChannels(this);

    this.#gateway = new DiscordGateway(this.#token);
    this.#gateway.start();

    this.#gateway.on('ready', $=> {
      this.api = new DiscordApi(this.#token);
      this.emit('ready');
    });

    this.#gateway.on('discordEvent', event => {
      if (event.name === 'GUILD_CREATE') {
        const guild = new DiscordGuild(this, event.data);
        guild.channels.forEach(channel => this.channels.set(channel.id, channel));
        this.guilds.set(guild.id, guild);
        event.data = guild;
      }
      else if (event.name === 'MESSAGE_CREATE') {
        event.data = new DiscordMessage(this, event.data);
      }


      this.emit(event.name, event.data);
      this.emit('discordEvent', { name: event.name, data: event.data });
    });
  }

  stop() {
    this.#gateway.close();
  }

}

module.exports = { DiscordBot, DiscordGateway, DiscordApi, DiscordGuilds, DiscordGuild, LazyDiscordGuild, DiscordChannels, DiscordChannel, LazyDiscordChannel, DiscordMessage, DiscordMessageType, DiscordMessageEmbed };
