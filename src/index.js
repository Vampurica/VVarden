/*
    5 Warden Discord Bot by Vampire#8144 (VVarden)
    Using ERIS for Discord
*/
import { readdir } from 'fs/promises';
import bot from './bot';
import pool from './database/pool';
import { setRandomStatus } from './utils';
import { logger } from './utils/logger';

logger.info('Testing database connection');

await pool.getConnection();

logger.info('Database connected');

logger.info('Initializing VVarden');

// Register event listeners
for (const event of await readdir('./src/events')) {
  await import(`./events/${event}`);

  logger.info(`Registered listener ${event.slice(0, -3)}`);
}

await bot.connect();

setInterval(setRandomStatus, 5000);
