const { func } = require('../functions.js');

// Scan Users
// In the future this could maybe be done slowly automatically
let scanusers = function () {
  bot.registerCommand(
    'scanusers',
    (msg, args) => {
      bot.guilds
        .get(msg.guildID)
        .fetchAllMembers()
        .then(() => {
          func.getGuildSettings(msg.guildID, function (guildInfo) {
            logMaster(
              'Guild ID: ' +
                msg.guildID +
                ' ' +
                guildInfo.guildname +
                ' / ' +
                msg.author.username +
                '#' +
                msg.author.discriminator +
                ' running `scanusers` command'
            );
            bot.createMessage(msg.channel.id, {
              embed: {
                description:
                  "Now scanning users. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.",
                color: 0xffff00,
              },
            });
            if (!guildInfo) {
              logMaster('Bot is in unknown guild???\n' + msg.guildID + ' Save me Vampire!!!');
            } else {
              bot.guilds.get(msg.guildID).members.forEach((value, key) => {
                let member = bot.guilds.get(msg.guildID).members.get(key);
                // Now Get Member Info
                func.getUserFromDB(member.id, function (oldUser) {
                  if (!oldUser) {
                    // User Does not exist, so do nothing I guess?
                    // Maybe in the future give a clean log
                  } else {
                    // User Exists, Process
                    let block = ['blacklisted', 'permblacklisted'];
                    if (block.includes(oldUser.status)) {
                      func.punishUser(member, guildInfo, oldUser.user_type, false);
                    }
                  }
                });
              });
            }
          });
        });
    },
    {
      requirements: {
        permissions: {
          administrator: true,
        },
      },
      description: 'Scan discord users',
      fullDescription: 'Scans your discord users and punishes them if blacklisted.',
      usage: 'scanusers',
      aliases: ['scan'],
      permissionMessage: 'You must be a SERVER ADMIN to use this command.',
    }
  );
};

module.exports = scanusers;
