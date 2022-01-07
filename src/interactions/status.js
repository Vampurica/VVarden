import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';
import { countBlacklistedUsers } from '../database/user';

bot.createGuildCommand('927660169968623657', {
  name: 'status',
  description: 'Shows bot status and stats about its services.',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  await interaction.defer();

  const blacklistedAccounts = await countBlacklistedUsers();

  interaction.createMessage({
    embeds: [
      {
        title: ':desktop: Bot Status',
        color: 0x008000,
        fields: [
          {
            name: 'Shard Count',
            value: `I am using ${bot.shards.size} Shards`,
            inline: false,
          },
          {
            name: 'Protected Guilds',
            value: `I am watching ${bot.guilds.size} Guilds`,
            inline: false,
          },
          {
            name: 'Blacklisted Accounts',
            value: `I am blocking ${blacklistedAccounts} discord accounts.`,
            inline: false,
          },
          {
            name: 'Bot Uptime Since Last Restart',
            value: `I have been up for ${Math.round((process.uptime() / 60) * 100) / 100} minutes`,
            inline: false,
          },
          {
            name: 'Memory Usage',
            value: `I am currently using ${
              Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
            } MB of RAM.`,
            inline: false,
          },
        ],
        footer: {
          text: 'VVarden by Vampire#8144',
        },
      },
    ],
  });
};
