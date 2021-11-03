// Rank

let rank = function () {
  bot.registerCommand(
    'rank',
    (msg, args) => {
      if (dev.includes(msg.author.id)) {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: msg.author.mention + ' Your wish is my command **Bot Owner**!',
            color: 0x008000,
          },
        });
      } else if (admin.includes(msg.author.id)) {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: msg.author.mention + ' Your wish is my command **Bot Admin**!',
            color: 0x008000,
          },
        });
      } else if (msg.member.permissions.has('administrator')) {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: `${msg.author.mention} Your wish is my command **Discord Admin**!`,
            color: 0x008000,
          },
        });
      } else if (msg.author.id == '102498921640640512') {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: `${msg.author.mention} You're looking great today Leah. Let me know what you need.`,
            color: 0x008000,
          },
        });
      } else if (msg.author.id == '160347445711077376') {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: `${msg.author.mention} What is thy bidding, my master?`,
            color: 0x008000,
          },
        });
      } else {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: `${msg.author.mention} You are a **Bot User**!`,
            color: 0x008000,
          },
        });
      }
    },
    {
      description: 'Check your perms rank',
      fullDescription: 'Responds with your bot command rank.',
      usage: 'rank',
    }
  );
};

module.exports = rank;
