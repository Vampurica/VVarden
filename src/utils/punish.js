import { Member } from 'eris';
import { logMaster } from './logger';
import { sendPrivateMessage, sendPunishFailedMessage, sendPunishMessage } from './messages';

const typeMap = {
  owner: 'punown',
  supporter: 'punsupp',
  cheater: 'puncheat',
  leaker: 'punleak',
};

/**
 * Punish bad user
 *
 * @export
 * @param {Member} member
 * @param {import("../database/guild").GuildData} guildData
 * @param {import("../database/user").UserData} userData
 * @param {boolean} [privateMessage = false]
 */
export default async function punish(member, guildData, userData, privateMessage = false) {
  if (member.bot) return;

  if (privateMessage) await sendPrivateMessage(member, guildData, userData);

  /** @type {('ban' | 'kick' | 'warn')} */
  const action = guildData[typeMap[userData.user_type]];

  try {
    switch (action) {
      case 'ban':
        await member.ban(0, `Warden - User Type ${userData.user_type}`);
        break;
      case 'kick':
        await member.kick(`Warden - User Type ${userData.user_type}`);
        break;
    }

    logMaster(`User ${member.id} / ${member.username} has been punished with a ${action} on join`);
    await sendPunishMessage(action, member, guildData, userData);
  } catch (err) {
    logMaster(err);
    sendPunishFailedMessage(action, member, guildData);
  }
}
