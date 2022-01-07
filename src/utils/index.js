import bot from '../bot';
import config from '../config';

const randomStatusList = [
  `Leakers | Use ${config.spc} help`,
  ` Guilds`,
  `Cheaters | Use ${config.spc} help`,
  `discord.gg/jeFeDRasfs`,
];

/**
 * Randomizes the bot status
 *
 * @export
 */
export function setRandomStatus() {
  const status = randomStatusList[Math.floor(Math.random() * randomStatusList.length)];

  bot.editStatus('online', {
    name: status.charAt(0) === ' ' ? `${bot.guilds.size}${status}` : status,
    type: 3,
  });
}
