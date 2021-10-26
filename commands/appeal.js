const { func } = require('../functions.js');

// Appeal
let appeal = function () {
  bot.registerCommand('appeal', (msg, args) => {
      if (args.length === 1) {
        const userID = (msg.mentions.length === 1 && msg.mentions[0].id) || (!isNaN(args[0]) && args[0]) || false
        if (userID) {
          const date = func.date();
          func.updateUserStatus(userID, 'appealed', undefined, `Appealed ${date} -${msg.author.username}`,
            function (ret) {
              bot.createMessage(msg.channel.id, {
                embed: {
                  description: ret,
                  author: {
                    name: `${msg.author.username}#${msg.author.discriminator}`,
                    icon_url: msg.author.avatarURL,
                  },
                  color: 0x008000,
                },
              });
            }
          );
        } else {
          bot.createMessage(msg.channel.id, 'Invalid UserID or Mention.');
        }
      } else {
        bot.createMessage(msg.channel.id, 'Invalid Argument Length.');
      }
    },
    {
      requirements: {
        userIDs: admin,
      },
      description: 'Appeal blacklisted user',
      fullDescription: 'Sets user status to appealed in the database',
      usage: 'appeal 0000000000',
      argsRequired: true,
      permissionMessage: 'You must be a BOT ADMIN to use this command.',
    }
  );
};

module.exports = appeal;
