const { func } = require('../functions.js');

// Procfile
let procfile = function () {
  bot.registerCommand(
    'procfile',
    (msg, args) => {
      // TODO: add validation, dev only so meh atm
      if (args.length == 3) {
        func.processCSVImport(args[0], args[1], args[2], function (ret) {
          if (!ret) {
            bot.createMessage(msg.channel.id, {
              embed: {
                description: 'Unable to start import.\nPrevious import has not been completed.',
                author: {
                  name: msg.author.username + '#' + msg.author.discriminator,
                  icon_url: msg.author.avatarURL,
                },
                color: 0x008000,
              },
            });
          }
          bot.createMessage(msg.channel.id, {
            embed: {
              description: 'Running command.\nCheck added users for results.',
              author: {
                name: msg.author.username + '#' + msg.author.discriminator,
                icon_url: msg.author.avatarURL,
              },
              color: 0x008000,
            },
          });
        });
      } else {
        bot.createMessage(msg.channel.id, 'Invalid Argument Length.');
      }
    },
    {
      requirements: {
        userIDs: dev,
      },
      description: 'Import File',
      fullDescription: 'Process and Import User Files',
      usage: 'procfile LeakerLeaks 0000000000000 leaker',
      aliases: ['pf'],
      hidden: true,
      argsRequired: true,
    }
  );
};

module.exports = procfile;
