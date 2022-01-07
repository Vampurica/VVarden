import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';
import config from '../config';
import { fetchGuildData } from '../database/guild';
import { fetchUserData, UserStatus } from '../database/user';
import { logMaster } from '../utils/logger';
import punish from '../utils/punish';

bot.createGuildCommand('927660169968623657', {
  name: 'scanusers',
  description: 'Scans your discord users and punishes them if blacklisted.',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.member || !interaction.guildID) return;

  await interaction.defer();

  if (!config.admin.includes(interaction.member.id))
    return interaction.createMessage({
      embeds: [
        {
          description: 'You must be a BOT ADMIN to use this command.',
          color: 0x800000,
        },
      ],
      flags: 64,
    });

  const guildData = await fetchGuildData(interaction.guildID);
  if (!guildData) return;

  const guild = bot.guilds.get(interaction.guildID);
  if (!guild) return;

  logMaster(
    `Guild ID: ${interaction.guildID} ${guildData.guildname} ${interaction.member.username}#${interaction.member.discriminator} is running \`scanusers\``
  );

  const membersCount = await guild.fetchAllMembers();

  const message = await interaction.createFollowup({
    embeds: [
      {
        description: `Now scanning ${membersCount} users. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.`,
        color: 0xffff00,
      },
    ],
  });

  await Promise.allSettled(
    guild.members.map(async (member) => {
      if (member.bot) return;

      message.edit({
        embed: {
          description: `Now scanning ${member.username}#${member.discriminator}. This may take awhile so be patient.\nBe aware this is resource intensive, and shouldn't be used often.\nAbuse of this command will result in punishment.`,
          color: 0xffff00,
        },
      });

      const userData = await fetchUserData(member.id);
      if (!userData) return;

      if (userData.status === UserStatus.BLACKLISTED || userData.status === UserStatus.PERMBLACKLISTED)
        await punish(member, guildData, userData);
    })
  );

  message.edit({
    embed: {
      description: `Scanning complete`,
      color: 0xffff00,
    },
  });
};
