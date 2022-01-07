import { Guild } from 'eris';
import pool from './pool.js';

/**
 * @typedef {Object} GuildData
 * @property {string} guildid
 * @property {string} guildname
 * @property {string} logchan
 * @property {string} punown
 * @property {string} punsupp
 * @property {string} punleak
 * @property {string} puncheat
 * @property {string} prefix
 */

/**
 * Save guild to the database
 *
 * @param {Guild} guild
 * @param {string} logChannel
 * @export
 */
export async function saveGuild(guild, logChannel) {
  const { id, name } = guild;

  const [result] = await pool.execute(
    'INSERT INTO guilds (guildid, guildname, logchan) VALUES (:id, :name, :chan) ON DUPLICATE KEY UPDATE guildname = :name',
    { id, name, chan: logChannel }
  );

  return result;
}

/**
 * Fetch the guild from the database
 *
 * @export
 * @param {string} guildId
 * @return {Promise<GuildData | null>}
 */
export async function fetchGuildData(guildId) {
  const [result] = await pool.execute('SELECT * FROM guilds WHERE guildid = ?', [guildId]);

  return result[0];
}

/**
 * Update guild's log channel in the database
 *
 * @export
 * @param {string} guildId
 * @param {string} logChannel
 * @return {Promise<void>}
 */
export async function updateLogChannel(guildId, logChannel) {
  await pool.execute('UPDATE guilds SET logchan = ? WHERE guildid = ?', [logChannel, guildId]);
}

/**
 * Update guild's log channel in the database
 *
 * @export
 * @param {string} guildId
 * @param {string} type
 * @param {string} action
 * @return {Promise<void>}
 */
export async function updatePunishAction(guildId, type, action) {
  await pool.query(`UPDATE guilds SET ?? = ? WHERE guildid = ?`, [type, action, guildId]);
}
