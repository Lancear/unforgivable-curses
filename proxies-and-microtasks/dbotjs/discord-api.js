const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');

class DiscordApi {
  static #version = 6;
  static #baseUrl = `https://discord.com/api/v${DiscordApi.#version}`;
  
  #token;

  channels;

  constructor(token) {
    this.#token = token;
  }

  getGuild(guildId) {
    return this.#request('GET', `/guilds/${guildId}`);
  }

  getChannel(channelId) {
    return this.#request('GET', `/channels/${channelId}`);
  }

  getMessage(channelId, messageId) {
    return this.#request('GET', `/channels/${channelId}/messages/${messageId}`);
  }

  createMessage(channelId, message) {
    if (typeof message === 'string') message = { content: message };

    let body = message;
    if (message.file) {
      body = new FormData();
      body.append('payload_json', JSON.stringify(message));
      body.append('file', fs.createReadStream(`${__dirname}/${message.file}`));
    }
  
    return this.#request('POST', `/channels/${channelId}/messages`, body);
  }

  deleteMessage(channelId, messageId) {
    return this.#request('DELETE', `/channels/${channelId}/messages/${messageId}`);
  }

  createReaction(channelId, messageId, emoji) {
    return this.#request('PUT', `/channels/${channelId}/messages/${messageId}/reactions/${encodeURIComponent(emoji)}/@me`);
  }

  addPinnedChannelMessage(channelId, messageId) {
    return this.#request('PUT', `/channels/${channelId}/pins/${messageId}`);
  }

  deletePinnedChannelMessage(channelId, messageId) {
    return this.#request('DELETE', `/channels/${channelId}/pins/${messageId}`);
  }

  listGuildMembers(guildId, limit, after) {
    return this.#request('GET', `/guilds/${guildId}/members${limit ? `?limit=${limit}` : ''}${after ? `&after=${after}` : ''}`);
  }

  #request =(method, path, body = undefined)=> {
    const url = `${DiscordApi.#baseUrl}${path}`;
    const req = { method, headers: { 'Authorization': `Bot ${this.#token}` } };

    if (body) {
      Object.assign(req.headers, (body instanceof FormData) ? body.getHeaders() : {'Content-Type': 'application/json'});
      req.body = (body instanceof FormData) ? body : JSON.stringify(body);
    }

    return fetch(url, req).then(async res => { 
      if (res.status < 200 || res.status >= 300) 
        throw `${res.status} ${res.statusText}! ${await res.text()}`; 
      else
       return (res.headers.has('content-type') && res.headers.get('content-type').startsWith('application/json')) ? res.json() : res.text(); 
    })
  };

}

module.exports = { DiscordApi };
