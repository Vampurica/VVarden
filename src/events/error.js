import bot from '../bot';
import { logMaster } from '../utils/logger';

bot.on('error', (err) => {
  if (err.message.includes('Connection reset by peer')) return;

  logMaster(err);
});
