const { func } = require('../functions.js');

// Procfile
let procfile = function () {
  bot.registerCommand(
    'procfile',
    (msg, args) => {
      if (func.processStatus() === undefined) {
        func.processCSVImport(msg);
      } else {
        bot.createMessage(msg.channel.id, {
          embed: {
            description: 'Unable to start imports.\nPrevious imports have not been completed.',
            author: {
              name: `${msg.author.username}#${msg.author.discriminator}`,
              icon_url: msg.author.avatarURL,
            },
            color: 0x008000,
          },
        });
      }
    },
    {
      requirements: {
        userIDs: dev,
      },
      description: 'Import File',
      fullDescription: 'Process and Import User Files',
      usage: 'procfile',
      aliases: ['pf'],
      hidden: true,
      argsRequired: false,
    }
  );
};

module.exports = procfile;
