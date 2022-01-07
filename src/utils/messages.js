import { Guild, Member } from 'eris';
import bot from '../bot';
import config from '../config';
import { logMaster } from './logger';

/**
 *
 *
 * @export
 * @param {string} channel
 * @param {Guild} guild
 */
export function sendWelcomeMessage(channel, guild) {
  bot
    .createMessage(channel, {
      embed: {
        title: `Hello ${guild.name}!`,
        description: `My name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nThank you for inviting me to your Discord Server!\nI'm trying to make the CFX Community a better place.\n\nMake sure to check my configuration settings by using the \`${config.spc}config\`
      command!\nI also need to have the permissions to kick and ban members, with a role higher than them!\n\nI'm already acting on new member joins. Check \`${config.spc}help\`
      to do a scan of current users.\n\nIf you want to contribute to the project, use the Official Discord: <https://discord.gg/jeFeDRasfs>`,
        color: 0x008000,
        footer: {
          text: 'VVarden by Vampire#8144',
        },
      },
    })
    .catch(logMaster);
}

/**
 * Send automod private message
 *
 * @export
 * @param {Member} member
 * @param {import("../database/guild").GuildData} guildData
 * @param {import("../database/user").UserData} userData
 */
export async function sendPrivateMessage(member, guildData, userData) {
  const channel = await bot.getDMChannel(member.id);

  try {
    await channel.createMessage(
      `:shield: Warden\nYou are being automodded by ${guildData.guildname} for being associated with ${
        userData.servers.split(';').length
      } Leaking or Cheating Discord Servers.\nYou may attempt to appeal this via the Official Warden Discord:\nhttps://discord.gg/jeFeDRasfs`
    );
  } catch (err) {
    bot
      .createMessage(guildData.logchan, {
        embed: {
          description: `:warning: Unable to Direct Message User <@${member.id}>`,
          author: {
            name: `${member.username}#${member.discriminator} / ${member.id}`,
            icon_url: member.avatarURL,
          },
          color: 0xffff00,
        },
      })
      .catch(logMaster);
  }
}

/**
 * Send message about failed punish
 *
 * @export
 * @param {('ban' | 'kick' | 'warn')} action
 * @param {Member} member
 * @param {import('../database/guild').GuildData} guildData
 */
export async function sendPunishFailedMessage(action, member, guildData) {
  await bot
    .createMessage(guildData.logchan, {
      embed: {
        description: `:warning: I tried to ${action} <@${member.id}> but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
        author: {
          name: `${member.username}#${member.discriminator} / ${member.id}`,
          icon_url: member.avatarURL,
        },
        color: 0x008000,
      },
    })
    .catch(logMaster);
}

/**
 * Send message about punish
 *
 * @export
 * @param {('ban' | 'kick' | 'warn')} action
 * @param {Member} member
 * @param {import('../database/guild').GuildData} guildData
 * @param {import('../database/user').UserData} userData
 */
export async function sendPunishMessage(action, member, guildData, userData) {
  try {
    await bot.createMessage(guildData.logchan, {
      embed: {
        description: `:shield: User <@${
          member.id
        }> has been punished with a ${action} on join.\nThey have been seen in ${
          userData.servers.split(';').length
        } bad discord servers.\n**User Status**: ${userData.status} / **User Type**: ${
          userData.user_type
        }.\n**Details**: ${userData.reason}`,
        author: {
          name: `${member.username}#${member.discriminator} / ${member.id}`,
          icon_url: member.avatarURL,
        },
        color: 0x008000,
      },
    });
  } catch (err) {
    sendPunishFailedMessage(action, member, guildData).catch(logMaster);
  }
}
