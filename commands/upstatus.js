const { func } = require('../functions.js');

// Upstatus
let upstatus = function () {
  bot.registerCommand(
    'upstatus',
    (msg, args) => {
      if (args.length >= 4) {
        if (msg.mentions.length == 1) {
          // Has a mention, no need to verify userID
          let userID = msg.mentions[0].id;
          let status = args[1];
          let usertype = args[2];
          let reason = args;
          let _ = reason.splice(0, 3);
          func.updateUserStatus(userID, status, usertype, reason.join(' '), function (ret) {
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
            let status = args[1];
            let usertype = args[2];
            let reason = args;
            let _ = reason.splice(0, 3);
            func.updateUserStatus(userID, status, usertype, reason.join(' '), function (ret) {
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
      description: 'Update User Status',
      fullDescription: 'Update user status in the database',
      usage: 'upstatus 0000000000 appealed leaker Appealed on 8/3/21 or whatever',
      aliases: ['ups'],
      argsRequired: true,
      permissionMessage: 'You must be a BOT ADMIN to use this command.',
    }
  );
};

module.exports = upstatus;
