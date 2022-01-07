import { Member } from 'eris';
import pool from './pool.js';

/**
 * User status
 * @readonly
 * @enum {string}
 */
export const UserStatus = {
  BLACKLISTED: 'blacklisted',
  PERMBLACKLISTED: 'permblacklisted',
  APPEALED: 'appealed',
  WHITELISTED: 'whitelisted',
};

/**
 * User type
 * @readonly
 * @enum {string}
 */
export const UserType = {
  LEAKER: 'leaker',
  CHEATER: 'cheater',
  OWNER: 'owner',
};

/**
 * Blacklist reason
 * @readonly
 * @enum {string}
 */
export const BlacklistReason = {
  AUTO: 'AUTO: Member of Blacklisted Discord',
  SEMI: 'Semi-Auto',
  MANUAL: 'Manual',
};

/**
 * Import type
 * @readonly
 * @enum {string}
 */
export const ImportType = {
  AUTO: 'Auto',
  SEMI: 'Semi-Auto',
  MANUAL: 'Manual',
};

/**
 * @typedef {Object} UserData
 * @property {string} userid
 * @property {string} avatar
 * @property {UserStatus} status
 * @property {UserType} user_type
 * @property {string} last_username
 * @property {string} servers
 * @property {string} roles
 * @property {ImportType} filter_type
 * @property {BlacklistReason} reason
 * @property {string} added_date
 */

/**
 * Fetch user from database
 *
 * @export
 * @param {string} userId
 * @return {Promise<UserData | null>}
 */
export async function fetchUserData(userId) {
  const [result] = await pool.execute('SELECT * FROM users WHERE userid = ?', [userId]);

  return result[0];
}

/**
 * Return count of blacklisted users
 *
 * @export
 * @return {Promise<number>}
 */
export async function countBlacklistedUsers() {
  const [result] = await pool.execute(
    "SELECT COUNT(userid) AS count FROM users WHERE status = 'blacklisted' OR status = 'permblacklisted'"
  );

  return result[0].count;
}
