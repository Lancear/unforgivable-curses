class LazyValue {
  constructor(promise) {
    return new Proxy(promise, { get: this.#get });
  }

  #get =(promise, selector)=> {
    if (selector in Object.getOwnPropertyDescriptors(Promise.prototype)) return promise[selector].bind(promise);
    if (selector === '$promise') return promise;
    return new LazyValue( promise.then(obj => obj[selector]) );
  };
}



class DiscordGuilds {
  #bot;
  constructor(bot = undefined, rawGuilds = undefined) {
    this.#bot = bot;
    const guilds = new Proxy(new Map(), { get: this.#get });
    if (rawGuilds) rawGuilds.forEach(guild => guilds.set(guild.id, new DiscordGuild(bot, guild)));
    return guilds;
  }

  #get =(guilds, id)=> {
    // ignore map properties
    const descriptor = Object.getOwnPropertyDescriptor(Map.prototype, id);
    if (descriptor) return (typeof descriptor.value === 'function') ? guilds[id].bind(guilds) : guilds[id];

    // get guild by id
    return new LazyDiscordGuild(guilds.has(id) ? Promise.resolve(guilds.get(id)) : this.#bot.api.getGuild(id).then(rawGuild => new DiscordGuild(this.#bot, rawGuild)));
  };
  
}

class DiscordGuild {
  #bot;
  constructor(bot, guild) {
    this.#bot = bot;
    guild.iconUrl = `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
    guild.channels = new DiscordChannels(bot, guild.channels);
    Object.assign(this, guild);
  }

  listMembers(limit, after) {
    return this.#bot.api.listGuildMembers(this.id, limit, after).then(members => this.members = members);
  }
}

class LazyDiscordGuild {

  constructor(guildPromise) {
    return new Proxy(guildPromise, { get: this.#get });
  }

  #get =(guildPromise, key)=> {
    // ignore promise properties
    if (key in Object.getOwnPropertyDescriptors(Promise.prototype)) return guildPromise[key].bind(guildPromise);

    // ignore functions
    if (key in Object.getOwnPropertyDescriptors(LazyDiscordGuild.prototype)) return this[key].bind(this, guildPromise);

    // add implicit then
    return new LazyValue( guildPromise.then(guild => guild[key]) );
  };

  listMembers(guildPromise, limit, after) {
    return guildPromise.then(guild => guild.listMembers(limit, after));
  }

}



class DiscordChannels {
  #bot;
  constructor(bot = undefined, rawChannels = undefined) {
    this.#bot = bot;
    const channels = new Proxy(new Map(), { get: this.#get });
    if (rawChannels) rawChannels.forEach(channel => channels.set(channel.id, new DiscordChannel(bot, channel)));
    return channels;
  }

  #get =(channels, id)=> {
    // ignore map properties
    const descriptor = Object.getOwnPropertyDescriptor(Map.prototype, id);
    if (descriptor) return (typeof descriptor.value === 'function') ? channels[id].bind(channels) : channels[id];

    // get channel by id
    return new LazyDiscordChannel(channels.has(id) ? Promise.resolve(channels.get(id)) : this.#bot.api.getChannel(id).then(rawChannel => new DiscordChannel(this.#bot, rawChannel)) );
  };
  
}

class DiscordChannel {
  
  #bot;
  constructor(bot, channel) {
    this.#bot = bot;
    Object.assign(this, channel);
  }

  send(message) {
    return this.#bot.api.createMessage(this.id, message);
  }

  getMessage(messageId) {
    return this.#bot.api.getMessage(this.id, messageId).then(rawMessage => new DiscordMessage(this.#bot, rawMessage));
  }

}

class LazyDiscordChannel {

  constructor(channelPromise) {
    return new Proxy(channelPromise, { get: this.#get });
  }

  #get =(channelPromise, key)=> {
    // ignore promise properties
    if (key in Object.getOwnPropertyDescriptors(Promise.prototype)) return channelPromise[key].bind(channelPromise);

    // ignore functions
    if (key in Object.getOwnPropertyDescriptors(LazyDiscordChannel.prototype)) return this[key].bind(this, channelPromise);

    // add implicit then
    return new LazyValue( channelPromise.then(channel => channel[key]) );
  };

  send(channelPromise, message) {
    return channelPromise.then(channel => channel.send(message));
  }

  getMessage(channelPromise, messageId) {
    return channelPromise.then(channel => channel.getMessage(messageId));
  }

}



class DiscordMessage {
  
  #bot;
  constructor(bot, message) {
    this.#bot = bot;
    message.author.avatarUrl = `https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}.png`;
    message.guild = bot.guilds[message.guild_id];
    message.channel = bot.channels[message.channel_id];
    Object.assign(this, message);
  }

  delete() {
    return this.#bot.api.deleteMessage(this.channel_id, this.id);
  }

  react(emoji) {
    return this.#bot.api.createReaction(this.channel_id, this.id, emoji);
  }

  pin() {
    return this.#bot.api.addPinnedChannelMessage(this.channel_id, this.id);
  }

  unpin() {
    return this.#bot.api.deletePinnedChannelMessage(this.channel_id, this.id);
  }

}

class DiscordMessageType {
  static DEFAULT = 0;
  static CHANNEL_PINNED_MESSAGE = 6;
}

class DiscordMessageEmbed {

  constructor() {
    this.embed = { fields: [] };
  }

  setTitle(title) {
    this.embed.title = title;
    return this;
  }

  setDescription(description) {
    this.embed.description = description;
    return this;
  }

  setAuthor(name, icon_url) {
    this.embed.author = { name, icon_url };
    return this;
  }

  setColor(color) {
    this.embed.color = color;
    return this;
  }

  setImage(url) {
    this.embed.image = { url };

    if (url.startsWith('attachment://')) {
      this.file = url.substring('attachment://'.length);
    }

    return this;
  }

  setFooter(text, icon_url) {
    this.embed.footer = { text, icon_url };
    return this;
  }

  addField(name, value, inline = undefined) {
    this.embed.fields.push({ name, value, inline });
    return this;
  }

}



class DiscordPresence {
  static Status = {
    ONLINE: 'online',
    DO_NOT_DISTURB: 'dnd',
    IDLE: 'idle',
    INVISIBLE: 'invisible',
    OFFLINE: 'offline'
  };

  status;
  game;
  afk;
  constructor(status, activity = undefined, afk = false) {
    this.status = status;
    this.game = activity;
    this.afk = afk;
  }
}

class DiscordActivity {
  static Type = {
    GAME: 0,
    STREAMING: 1,
    LISTENING: 2,
    CUSTOM: 4
  };

  type;
  name;
  constructor(type, name) {
    this.type = type;
    this.name = name;
  }
}


module.exports = { DiscordGuilds, DiscordGuild, LazyDiscordGuild, DiscordChannels, DiscordChannel, LazyDiscordChannel, DiscordMessage, DiscordMessageType, DiscordMessageEmbed, DiscordPresence, DiscordActivity };
