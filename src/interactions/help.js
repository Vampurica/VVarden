import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';

bot.createGuildCommand('927660169968623657', {
  name: 'help',
  description: 'List all the bot commands',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  const commands = await bot.getGuildCommands('927660169968623657');

  if (!interaction.member) return;

  interaction.createMessage({
    embeds: [
      {
        title: 'Command List',
        author: {
          name: `${interaction.member.username}#${interaction.member.discriminator}`,
          icon_url: interaction.member.avatarURL,
        },
        color: 0x008000,
        fields: commands.map((command) => ({
          name: `/${command.name}`,
          value: `- ${command.description}`,
          inline: false,
        })),
        footer: {
          text: 'VVarden by Vampire#8144',
        },
      },
    ],
  });
};
