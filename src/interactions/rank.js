import { Member, CommandInteraction, Constants } from 'eris';
import bot from '../bot';
import config from '../config';

bot.createGuildCommand('927660169968623657', {
  name: 'rank',
  description: 'Responds with your bot command rank.',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
});

/**
 * Get message by rank
 *
 * @param {Member} member
 */
function getRankMessage(member) {
  const { id, permissions } = member;

  if (config.dev.includes(id)) return 'Your wish is my command **Bot Owner**!';
  if (config.admin.includes(id)) return 'Your wish is my command **Bot Admin**!';
  if (permissions.has('administrator')) return 'Your wish is my command **Discord Admin**!';

  if (id === '102498921640640512') return `You're looking great today Leah. Let me know what you need.`;
  if (id === '160347445711077376') return 'What is thy bidding, my master';

  return 'You are a **Bot User**!';
}

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.member) return;

  interaction.createMessage({
    embeds: [
      {
        description: `${interaction.member.mention} ${getRankMessage(interaction.member)}`,
        color: 0x008000,
      },
    ],
  });
};
