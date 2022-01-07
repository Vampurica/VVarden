import winston from 'winston';
import config from '../config';
import bot from '../bot';

export const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      filename: 'botinfo.log',
    }),
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  ],
});

/**
 * Logging Wrapper
 *
 * Log message to the configured discord log channel.
 *
 * @param {string | Error} message
 */
export function logMaster(message) {
  if (message instanceof Error) {
    logger.error(message.stack);

    bot
      .createMessage(config.logChannel, {
        embed: {
          title: message.name,
          description: message.stack || message.message,
          color: 0x800000,
          footer: {
            text: new Date().toLocaleString().slice(0, 24),
          },
        },
      })
      .catch(logger.error);

    return;
  }

  logger.info(message);

  bot
    .createMessage(config.logChannel, {
      embed: {
        description: message,
        color: 0x800000,
        footer: {
          text: new Date().toLocaleString().slice(0, 24),
        },
      },
    })
    .catch(logger.error);
}
