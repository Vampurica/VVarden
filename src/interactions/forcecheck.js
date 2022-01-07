import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';

bot.createGuildCommand('927660169968623657', {
  name: 'forcecheck',
  description: 'Checks the DB status of a user and global automods if needed.',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      name: 'user',
      description: 'Member to force check',
      type: Constants.ApplicationCommandOptionTypes.USER,
    },
  ],
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.member) return;
};
