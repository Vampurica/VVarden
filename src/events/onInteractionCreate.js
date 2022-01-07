import { CommandInteraction } from 'eris';
import bot from '../bot';
import { logMaster } from '../utils/logger';

bot.on('interactionCreate', async (interaction) => {
  if (!(interaction instanceof CommandInteraction)) return;

  const handler = await import(`../interactions/${interaction.data.name}`);

  if (!handler || !handler.default) return logMaster(`Undefined interaction for ${interaction.data.name}`);

  try {
    await Promise.resolve(handler.default(interaction));
  } catch (err) {
    logMaster(err);
  }
});
