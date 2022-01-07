import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';
import config from '../config';
import { fetchGuildData, updateLogChannel, updatePunishAction } from '../database/guild';

bot.createGuildCommand('927660169968623657', {
  name: 'config',
  description: 'Adjust this Guilds Settings for Warden',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
  options: [
    {
      name: 'show',
      description: 'Show guild configuration',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
    },
    {
      name: 'logchan',
      description: 'Configure log channel',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'channel',
          description: 'Channel where to store logs',
          type: Constants.ApplicationCommandOptionTypes.CHANNEL,
          required: true,
        },
      ],
    },
    {
      name: 'punown',
      description: 'Punish owners action',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'action',
          description: 'Punish owners action',
          type: Constants.ApplicationCommandOptionTypes.STRING,
          choices: [
            { name: 'Kick', value: 'kick' },
            { name: 'Ban', value: 'ban' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'punsupp',
      description: 'Punish supporters action',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'action',
          description: 'Punish supporters action',
          type: Constants.ApplicationCommandOptionTypes.STRING,
          choices: [
            { name: 'Kick', value: 'kick' },
            { name: 'Ban', value: 'ban' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'punleak',
      description: 'Punish leakers action',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'action',
          description: 'Punish leakers action',
          type: Constants.ApplicationCommandOptionTypes.STRING,
          choices: [
            { name: 'Warn', value: 'warn' },
            { name: 'Kick', value: 'kick' },
            { name: 'Ban', value: 'ban' },
          ],
          required: true,
        },
      ],
    },
    {
      name: 'puncheat',
      description: 'Punish cheaters action',
      type: Constants.ApplicationCommandOptionTypes.SUB_COMMAND,
      options: [
        {
          name: 'action',
          description: 'Punish cheaters action',
          type: Constants.ApplicationCommandOptionTypes.STRING,
          choices: [
            { name: 'Warn', value: 'warn' },
            { name: 'Kick', value: 'kick' },
            { name: 'Ban', value: 'ban' },
          ],
          required: true,
        },
      ],
    },
  ],
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  if (!interaction.member || !interaction.guildID) return;

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

  const command = interaction.data.options?.at(0);
  if (!command || command.type !== Constants.ApplicationCommandOptionTypes.SUB_COMMAND) return;

  if (command.name === 'show')
    return interaction.createMessage({
      embeds: [
        {
          title: 'Server Configuration',
          description: `To change a setting use the /config command`,
          color: 0x008000,
          fields: [
            {
              name: 'logchan - Log Channel',
              value: `I am using <#${guildData.logchan}> for my logs\nThis is where I will post messages about the actions I take.`,
            },
            {
              name: 'punown - Punish Owners [kick/ban]',
              value: `I am set to **${guildData.punown}** Leak and Cheat Server Owners\nThese are the Owners and Staff Members of these Discords`,
            },
            {
              name: 'punsupp - Punish Supporters [kick/ban]',
              value: `I am set to **${guildData.punsupp}** Leak and Cheat Server Supporters\nThese are Nitro Boosters, Customers, or other types of Donators.`,
            },
            {
              name: 'punleak - Punish Leakers [warn/kick/ban]',
              value: `I am set to **${guildData.punleak}** Members of Leaking Discords.\nThese are users with only a Member Role in these servers.`,
            },
            {
              name: 'puncheat - Punish Cheaters [warn/kick/ban]',
              value: `I am set to **${guildData.puncheat}** Members of Cheating Discords.\nThese are users with only a Member Role in these servers.`,
            },
          ],
          footer: {
            text: 'VVarden by Vampire#8144',
          },
        },
      ],
    });

  if (command.name === 'logchan') {
    const channelId = command.options?.at(0);
    if (!channelId || channelId.type !== Constants.ApplicationCommandOptionTypes.CHANNEL) return;

    const channel = interaction.data.resolved?.channels?.get(channelId.value);
    if (!channel) return;

    if (channel.type !== Constants.ChannelTypes.GUILD_TEXT) return;

    await updateLogChannel(interaction.guildID, channel.id);

    return interaction.createMessage({
      embeds: [
        {
          description: `Log channel has been configured to <#${channel.id}>`,
          author: {
            name: `${interaction.member.username}#${interaction.member.discriminator}`,
            icon_url: interaction.member.avatarURL,
          },
          color: 0x008000,
        },
      ],
    });
  }

  if (!command.name.startsWith('pun')) return;

  const action = command.options?.at(0);
  if (!action || action.type !== Constants.ApplicationCommandOptionTypes.STRING) return;

  await updatePunishAction(interaction.guildID, command.name, action.value);

  return interaction.createMessage({
    embeds: [
      {
        description: `\`${command.name}\` has been configured to **${action.value}** users`,
        author: {
          name: `${interaction.member.username}#${interaction.member.discriminator}`,
          icon_url: interaction.member.avatarURL,
        },
        color: 0x008000,
      },
    ],
  });
};

//TODO: Maybe more refactor :D
