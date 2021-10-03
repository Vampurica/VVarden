const { func } = require('../functions.js');

// Anonymize
const anonymize = function () {
  bot.registerCommand(
    'anonymize',
    (msg, args) => {
      if ((args.length = 1)) {
        if (msg.mentions.length == 1) {
          // Has a mention, no need to verify userID
          let userID = msg.mentions[0].id;
          func.anonymizeUser(userID, function (ret) {
            bot.createMessage(msg.channel.id, {
              embed: {
                description: ret,
                author: {
                  name: msg.author.username + '#' + msg.author.discriminator,
                  icon_url: msg.author.avatarURL,
                },
                color: 0x008000,
              },
            });
          });
        } else {
          // No Mention, try and validate an ID
          let userID = args[0];
          if (!isNaN(userID)) {
            // Valid number, run it
            func.anonymizeUser(userID, function (ret) {
              bot.createMessage(msg.channel.id, {
                embed: {
                  description: ret,
                  author: {
                    name: msg.author.username + '#' + msg.author.discriminator,
                    icon_url: msg.author.avatarURL,
                  },
                  color: 0x008000,
                },
              });
            });
          } else {
            // Isn't a number, shouldn't be an ID
            bot.createMessage(msg.channel.id, 'Invalid UserID or Mention.');
          }
        }
      } else {
        bot.createMessage(msg.channel.id, 'Invalid Argument Length.');
      }
    },
    {
      requirements: {
        userIDs: admin,
      },
      description: 'Anonymize a user',
      fullDescription: 'Anonymize a user in the database',
      usage: 'anonymize 000000000',
      aliases: ['anon'],
      argsRequired: true,
      hidden: true,
    }
  );
};

module.exports = anonymize;
