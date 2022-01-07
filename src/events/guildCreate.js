import bot from '../bot';
import { saveGuild } from '../database/guild';
import { logMaster } from '../utils/logger';
import { sendWelcomeMessage } from '../utils/messages';

// Triggers when bot is invited to a new guild
bot.on('guildCreate', async (guild) => {
  const guildChannel = guild.systemChannelID ?? '861767445832269844';

  logMaster(
    `Joined new guild ${guild.name} with ${guild.memberCount} members.\nGuild owner is <@${guild.ownerID}> ${guild.ownerID}`
  );

  try {
    await saveGuild(guild, guildChannel);

    sendWelcomeMessage(guildChannel, guild);
  } catch (err) {
    logMaster(err);
  }
});
