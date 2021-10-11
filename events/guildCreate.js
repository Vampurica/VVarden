const { func } = require('../functions.js');
const { spc } = require('../config.js');

// Triggers when bot is invited to a new guild
const guildCreate = function (guild) {
  // Invited to New Guild
  logMaster(
    'Joined New Guild ' +
      guild.name +
      ' with ' +
      guild.memberCount +
      ' members\nGuild Owner is <@' +
      guild.ownerID +
      '> ' +
      guild.ownerID +
      ''
  );
  let guildChannel = guild.systemChannelID !== null ? guild.systemChannelID : '861767445832269844';
  console.log('logchan: ' + guildChannel);
  func.addGuildToDB(guild.id, guild.name, guildChannel);
  bot.createMessage(guildChannel, {
    embed: {
      title: 'Hello ' + guild.name + '!',
      description:
        "My name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nThank you for inviting me to your Discord Server!\nI'm trying to make the CFX Community a better place.\n\nMake sure to check my configuration settings by using the `" +
        spc +
        "config` command!\nI also need to have the permissions to kick and ban members, with a role higher than them!\n\nI'm already acting on new member joins. Check " +
        spc +
        'help to do a scan of current users.\n\nIf you want to contribute to the project, use the Official Discord: <https://discord.gg/jeFeDRasfs>',
      color: 0x008000,
      footer: {
        // Footer text
        text: 'VVarden by Vampire#8144',
      },
    },
  });
};

module.exports = guildCreate;
