import { Constants } from 'eris';
import { readdir } from 'fs/promises';
import bot from '../bot';
import { logger } from '../utils/logger';

bot.on('ready', async () => {
  // Register interactions (must happen inside bot ready)
  for (const interaction of await readdir('./src/interactions')) {
    await import(`../interactions/${interaction}`);

    logger.info(`Registered interaction /${interaction.slice(0, -3)}`);
  }

  logger.info('Logged into Discord!');

  bot.editStatus('online', {
    name: 'Boot Up Noises!',
    type: Constants.ActivityTypes.WATCHING,
  });
});
