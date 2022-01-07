import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';
import { fetchUserData, UserStatus } from '../database/user';

bot.createGuildCommand('927660169968623657', {
  name: 'checkuser',
  description: 'Checks a users database status.',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      name: 'user',
      description: 'Member to Check',
      type: Constants.ApplicationCommandOptionTypes.USER,
    },
    {
      name: 'hidden',
      description: 'Hide the bot response?',
      type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
    },
  ],
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.member) return;

  const user = interaction.data.options?.find(
    (option) => option.name === 'user' && option.type === Constants.ApplicationCommandOptionTypes.USER
  );

  const hidden = interaction.data.options?.find(
    (option) => option.name === 'hidden' && option.type === Constants.ApplicationCommandOptionTypes.BOOLEAN
  );

  // @ts-ignore
  const userInfo = await fetchUserData(user?.value || interaction.member.id);

  if (!userInfo || userInfo.status === UserStatus.APPEALED || userInfo.status === UserStatus.WHITELISTED)
    return interaction.createMessage({
      embeds: [
        {
          description: ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
          color: 0xffff00,
        },
      ],
      flags: hidden && 64,
    });

  interaction.createMessage({
    embeds: [
      {
        title: ':shield: User Blacklisted',
        description: `<@${userInfo.userid}> has been seen in ${
          userInfo.servers.split(';').length
        } bad Discord servers.`,
        author: {
          name: userInfo.last_username,
          icon_url: userInfo.avatar,
        },
        thumbnail: { url: userInfo.avatar },
        color: 0x800000,
        fields: [
          {
            name: 'User Information',
            value: `**ID**: ${userInfo.userid} / **Name**: ${userInfo.last_username}`,
          },
          {
            name: 'Blacklist Reason',
            value: `**User Type**: ${userInfo.user_type}\n**Details**: ${userInfo.reason}`,
          },
          {
            name: `Added Type: ${userInfo.filter_type}`,
            value: `**Date Added**: ${userInfo.added_date}`,
          },
        ],
        footer: {
          text: 'VVarden by Vampire#8144',
        },
      },
    ],
    flags: hidden && 64,
  });
};
