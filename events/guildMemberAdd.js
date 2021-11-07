const { func } = require('../functions.js');

// Triggers when a user joins a guild the bot is in
const guildMemberAdd = function (guild, member) {
  // Member Joined Guild, process blacklist
  // First get Guild Settings
  func.getGuildSettings(guild.id, async function (guildInfo) {
    if (!guildInfo) {
      logMaster(`Bot is in an unknown guild?\n${guild.id} / ${guild.name} Save me Vampire!!!`);
    } else {
      // Now Get Member Info
      const oldUser = await func.getUserFromDB(member.id)
      if (!oldUser) {
        // User Does not exist, so do nothing I guess?
        // Maybe in the future give a clean log
      } else {
        // User Exists, Process
        let block = ['blacklisted', 'permblacklisted'];
        if (block.includes(oldUser.status)) {
          func.punishUser(member, guildInfo, oldUser, true);
        }
      }
    }
  });
};

module.exports = guildMemberAdd;
