import bot from '../bot';
import { fetchGuildData } from '../database/guild';
import { fetchUserData, UserStatus } from '../database/user';
import { logMaster } from '../utils/logger';
import punish from '../utils/punish';

// Triggers when a user joins a guild the bot is in
bot.on('guildMemberAdd', async (guild, member) => {
  try {
    const guildData = await fetchGuildData(guild.id);

    if (!guildData) return logMaster(`Bot is in an unknown guild?\n${guild.id} / ${guild.name} Save me Vampire!!!`);

    const userData = await fetchUserData(member.id);

    if (!userData) return logMaster(`User ${member.id} not found in database`);

    if (userData.status === UserStatus.BLACKLISTED || userData.status === UserStatus.PERMBLACKLISTED) {
      await punish(member, guildData, userData, true);
    }
  } catch (err) {
    logMaster(err);
  }
});
