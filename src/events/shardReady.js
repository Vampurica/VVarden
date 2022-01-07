import bot from '../bot';
import { logger } from '../utils/logger';

bot.on('shardReady', (id) => logger.info(`Shard #${id + 1} launched!`));
