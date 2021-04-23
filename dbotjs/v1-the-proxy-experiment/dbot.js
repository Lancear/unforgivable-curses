const { DiscordBot, DiscordMessageEmbed } = require('./discord');
const fetch = require('node-fetch');

class Dbotjs {

  static prefix = '$';
  static color = 0xd6376e;
  static state = {};
  static pinMessages = {};

  static #bot;
  static start(token) {
    const bot = new DiscordBot(token);
    bot.start();

    bot.on('GUILD_CREATE', guild => {
      this.state[guild.id] = { yeahCount: 0 };
      guild.state = this.state[guild.id];
    });

    bot.on('MESSAGE_REACTION_ADD', async reaction => {
      const message = await this.#bot.channels[reaction.channel_id].getMessage(reaction.message_id);

      if (reaction.guild_id !== '699002216769388544' && reaction.emoji.name === '📌' && !message.pinned) {
        message.pin().catch(console.error);
      }
    });

    bot.on('MESSAGE_REACTION_REMOVE', async reaction => {
      const message = await this.#bot.channels[reaction.channel_id].getMessage(reaction.message_id);

      if (reaction.guild_id !== '699002216769388544' && reaction.emoji.name === '📌' && message.pinned && (!message.reactions || !message.reactions.find(reaction => reaction.emoji.name === '📌'))) {
        const messageRef = message.id + "/" + message.channel_id;
        const pinMessage = Dbotjs.pinMessages[messageRef];

        message.unpin().catch(console.error);
        this.#bot.api.deleteMessage(pinMessage.channel_id, pinMessage.id).catch(console.error);
        delete Dbotjs.pinMessages[messageRef];
      }
    });

    bot.on('MESSAGE_CREATE', async message => {
      if (message.type === 6) {
        const messageRef = message.message_reference.message_id + '/' + message.message_reference.channel_id;
        const pinMessage = { id: message.id, channel_id: message.channel_id };
        Dbotjs.pinMessages[messageRef] = pinMessage;
      }
    });

    bot.on('MESSAGE_CREATE', async message => {
      if (message.author.bot) return;

      const words = message.content.split(/[ \t\r\n]/);

      if (message.content === `${Dbotjs.prefix}help`) {
        const embed = new DiscordMessageEmbed();
        embed
          .setTitle('dbotjs - help')
          .setColor(Dbotjs.color)
          .addField('Message Embeds', `\`[comment] <message-link> [comment]\`\nCreates a message embed with an optional comment, the message-link must be the first/last word of the message.`)
          .addField('Reminders', `\`${Dbotjs.prefix}reminder <minutes> message\` ... reminds you of stuff`)
          .addField('Member count', `\`${Dbotjs.prefix}members\` ... shows the membercount`)
          .addField('Code', `\`${Dbotjs.prefix}code\` ... sends you the code of this discord bot`)
          .addField('Big emojis', `\`${Dbotjs.prefix}big <custom-emoji>\` ... posts the original emoji image`)
          .addField('Yeah count', `\`${Dbotjs.prefix}yeah-count\` ... the amount of yeah messages on this guild since the last bot-restart or \`${Dbotjs.prefix}yeah-reset\`.`)
          .addField('Ping', `\`${Dbotjs.prefix}ping\` ... pings the bot to test the connection`)
          .addField('Help', `\`${Dbotjs.prefix}help\` ... what would this command do? 🤔\nCommand Arguments: \`<varName>\` -> 1 word, \`varName\` -> spaces allowed, \`[varname]\` -> optional and spaces are allowed`);

        message.channel.send(embed).catch(console.error);
      }
      else if (message.content === `${Dbotjs.prefix}ping`) {
        message.channel.send('pong!').catch(console.error);
      }
      else if (message.content === `${Dbotjs.prefix}code`) {
        message.channel.send({ file: __filename.split('/')[__filename.split('/').length - 1], content: 'The magic code that keeps my heart beating!' }).catch(console.error);
      }
      else if (message.content ===  `${Dbotjs.prefix}members`) {
        await message.guild.listMembers(1000).catch(console.error);
        message.channel.send(`${await message.guild.name} has ${await message.guild.members.length} members! 🥳`).catch(console.error);
      }
      else if (message.content.startsWith(`${Dbotjs.prefix}reminder `)) {
        if (words.length < 3) return message.channel.send(`Not enough arguments!\nSyntax: ${Dbotjs.prefix}reminder <minutes> message`).catch(console.error);

        try {
          words.shift(); // command name
          const mins = parseFloat(words.shift());
          message.react('⌛');
          setTimeout($=> message.channel.send(`<@!${message.author.id}>, reminder: ${words.join(' ')}`).catch(console.error), mins * 60 * 1000);
        }
        catch (err) {
          message.channel.send("Invalid number of minutes!").catch(console.error);
        }
      }
      else if (message.content.startsWith(`${Dbotjs.prefix}big `)) {
        const words = message.content.split(/[ \t\r\n]/);
        if (words.length < 2) return message.channel.send(`Not enough arguments!\nSyntax: ${Dbotjs.prefix}big <custom-emoji>`).catch(console.error);

        try {
          const emojiId = words[1].split(':')[2].replace('>', '');
          message.channel.send(`https://cdn.discordapp.com/emojis/${emojiId}.png`).then($=> message.delete()).catch(console.error);
        }
        catch (err) {
          message.channel.send("Invalid custom emoji!").catch(console.error);
        }
      }
      else if (message.content.toLowerCase() === '!d bump') {
        const guild = await message.guild;

        if (!guild.state.bumpTimer) {
          message.react('⌛');
          guild.state.bumpTimer = setTimeout($=> {
            message.channel.send(`It's time to bump the server 😘\n<@&741322954528522370> please use \`!d bump\``).catch(console.error);
            delete guild.state.bumpTimer;
          }, 2 * 60 * 60 * 1000);
        }
      }
      else if (message.content === `${Dbotjs.prefix}yeah-count`) {
        message.channel.send(`${await message.guild.state.yeahCount} yeahs sofar!`).catch(console.error);
      }
      else if (message.content === `${Dbotjs.prefix}reset-yeah-count`) {
        const guild = await message.guild;
        guild.state.yeahCount = 0;
      }
      else if (['yea', 'yea!', 'yeah', 'yeah!'].includes(message.content.toLowerCase())) {
        const guild = await message.guild;
        guild.state.yeahCount++;
      }
      else if (Dbotjs.#is_message_link(words[0]) || Dbotjs.#is_message_link(words[words.length - 1])) {
        const link = Dbotjs.#is_message_link(words[0]) ? words[0] : words[words.length - 1];
        const comment = message.content.replace(new RegExp(`[\r\n\t ]?${link.split('.').join('\.')}[\r\n\t ]?`), '');
    
        const originalMessage = await Dbotjs.#fetch_message_from_link(await message.channel, link);
        if (!originalMessage) return;
        message.channel.send( await Dbotjs.#create_messageEmbed(originalMessage, link, comment, message.author) ).then($=> message.delete()).catch(console.error);
      }
    });

    Dbotjs.#bot = bot;
  }

  static stop() {
    Dbotjs.#bot.stop();
  }


  static #is_message_link =(text)=> {
    const path = text.split(new RegExp('://|/'));
    
    if (!['http', 'https'].includes(path[0]))
      return false;
  
    if (!(path[1].endsWith('discordapp.com') || path[1].endsWith('discord.com')))
      return false;
  
    if (path[2] !== 'channels')
      return false;
  
    return (Dbotjs.#isInt(path[3]) && Dbotjs.#isInt(path[4]) && Dbotjs.#isInt(path[5]));
  };
  
  static #isInt =(text)=> {
    try {
      parseInt(text);
      return true;
    }
    catch(err) {
      return false;
    }
  };

  static #is_gif =(text)=> {
    return text.startsWith('https://tenor.com/view/');
  };

  static #is_image =(attachment)=> {
    if (!attachment)
      return false;

    const filename = attachment.filename.toLowerCase().split('.');
    const extension = filename[filename.length - 1];
    return (['png', 'jpg', 'jpeg', 'gif'].includes(extension));
  };

  static #get_ids =(link)=> {
    const path = link.split(new RegExp('://|/'));
  
    return {
      guild:    path[3],
      channel:  path[4],
      message:  path[5]
    };
  };

  static #get_gifUrl =(gif)=> {
    return fetch(`${gif}.gif`).then(res => res.url).catch(err => null);      
  };
  
  static #fetch_message_from_link =async(replyChannel, link)=> {
    const ids = Dbotjs.#get_ids(link);
  
    try {
      const guild = await Dbotjs.#bot.guilds[ids.guild];
      const channel = await guild.channels[ids.channel];
      const message = await channel.getMessage(ids.message).then(message => {
        message.guild_id = ids.guild;
        message.guild = Dbotjs.#bot.guilds[ids.guild];
        return message;
      }).catch(console.error);

      return message;
    }
    catch (err) {
      replyChannel.send(err).catch(console.error);
      return null;
    }
  };

  static #create_messageEmbed =async(originalMessage, link, comment, author)=> {
    const embed = new DiscordMessageEmbed();
    let authorName = originalMessage.author.username;
    let authorAvatar = originalMessage.author.avatarUrl;
    let originalContent = originalMessage.content;
    let originalAttachments = originalMessage.attachments;
  
    embed.setColor(Dbotjs.color);

    if (comment.length > 0) {
      authorName = author.username;
      
      if (authorName !== originalMessage.author.username) {
        authorName += `, ${originalMessage.author.username}`;
      }
      
      authorAvatar = author.avatarUrl;
    }
  
    embed.setAuthor(authorName, authorAvatar);
    const words = originalMessage.content.split(/[ \t\r\n]/);
  
    if (Dbotjs.#is_gif(words[0]) || Dbotjs.#is_gif(words[words.length - 1])) {
      const gif = Dbotjs.#is_gif(words[0]) ? words[0] : words[words.length - 1];
      const gifUrl = await Dbotjs.#get_gifUrl(gif);
  
      if (gifUrl) {
        embed.setImage(gifUrl);
        originalContent = originalContent.replace(new RegExp(`[\r\n\t ]?${gif.split('.').join('\.')}[\r\n\t ]?`), '');
      }
    }
    else if (Dbotjs.#is_image(originalAttachments[0]) || Dbotjs.#is_image(originalAttachments[originalAttachments.length - 1])) {
      const imageUrl = Dbotjs.#is_image(originalAttachments[0]) 
        ? originalAttachments[0].url 
        : originalAttachments[originalAttachments.length - 1].url;
  
      embed.setImage(imageUrl);
      originalAttachments = originalAttachments.filter(attachment => attachment.url !== imageUrl);
    }
  
    if (comment.length > 0) {
      embed.addField(`Comment by ${author.username}`, comment);
      embed.addField(`Original message by ${originalMessage.author.username}`, `${originalContent}\n[Jump to message](${link})`);
    }
    else {
      embed.setDescription(`${originalContent}\n[Jump to message](${link})`);
    }
  
    if (originalAttachments.length > 0) {
      const attachments = originalAttachments.map(attachment => `[${attachment.filename}](${attachment.url})`);
      embed.addField('Attachments', attachments.join(', '));
    }

    embed.setFooter(`${await originalMessage.guild.name} #${await originalMessage.channel.name}`, await originalMessage.guild.iconUrl);
    return embed;
  }

}

module.exports = Dbotjs;
