const config = require('./config.js');
const fs = require('fs');
const readline = require('readline');
const badservers = require('./badservers.js');
const util = require('./utils.js');
let processState;

// MySQL
const { createPool } = require('mysql2/promise');
const pool = createPool({
  connectionLimit: 10,
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  charset: 'utf8mb4_general_ci',
  namedPlaceholders: true,
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: false,
  trace: false,
});

const execute = async (query, parameters) => {
  try {
    const [result] = await pool.execute(query, parameters);
    return result;
  } catch (error) {
    throw error;
  }
};

// Functions
const func = {
  sleep: function (ms) {
    const promise = new Promise((resolve) => setTimeout(resolve, ms));
    return promise;
  },

  date: function (time) {
    if (time && !time.match(/^\d/)) return time;
    const date = new Intl.DateTimeFormat('en-US', {
      dateStyle: 'long',
    }).format(time ? new Date(time.replace(/-/g, '/')) : Date.now());
    return date;
  },

  processStatus: function (set) {
    if (set) {
      if (set === 'done') processState = undefined;
      else processState = set;
    }
    return processState;
  },

  randomStatus: function () {
    // Randomizes the bot status from the list
    let rStatus = [
      `Leakers | Use ${config.spc} help`,
      ` Guilds`,
      `Cheaters | Use ${config.spc} help`,
      `discord.gg/jeFeDRasfs`,
    ];
    let newStatus = util.selectRandom(rStatus);
    if (newStatus.charAt(0) == ' ') {
      // Add the number of guilds to the status that shows it
      // Would have done it above, but then it wouldn't update dynamically
      // Templating might be an option, needs testing
      newStatus = bot.guilds.size + newStatus;
    }
    bot.editStatus('online', {
      name: newStatus,
      type: 3,
    });
  },

  chanLog: function (chan, author, mess, color) {
    // Simple Channel Log Wrapper
    bot
      .createMessage(chan, {
        embed: {
          description: mess,
          author: {
            name: `${author.username}#${author.discriminator} / ${author.id}`,
            icon_url: author.avatarURL,
          },
          color: color,
        },
      })
      .catch((err) => {
        logMaster(err);
      });
  },

  combineRoles: function (oldRoles, newRoles) {
    // Takes a delimited role string and combines it, removing dupes
    let wipOldArr = oldRoles.split(';');
    let wipNewArr = newRoles.split(';');
    let combArr = wipOldArr.concat(wipNewArr.filter((item) => wipOldArr.indexOf(item) < 0));

    return combArr;
  },

  getUserFromDB: function (userID, callback) {
    // Calls the database to get the row about the specified user.
    execute('SELECT * FROM users WHERE userid = ?', [userID])
      .then((results) => {
        if (results && results[0]) return callback(results[0]);
        else return callback();
      })
      .catch(console.error);
  },

  addUserToDB: function (userID, avatar, status, usertype, lastuser, server, roles, filtertype, callback) {
    // Adds the user to the database. Expected to be used by the automated system primarily

    // First check the database for the user
    func.getUserFromDB(userID, function (oldUser) {
      if (!oldUser) {
        // Add New User
        execute(
          'INSERT INTO users (userid, avatar, user_type, last_username, servers, roles) VALUES (?, ?, ?, ?, ?, ?)',
          [userID, avatar, usertype, lastuser, server, roles]
        )
          .then((results) => {
            func.globalFindAndCheck(userID);
            return callback(usertype, lastuser, userID);
          })
          .catch(console.error);
      } else {
        // Update Existing User
        let newRoles = func.combineRoles(oldUser.roles, roles).join(';');
        let spServers = oldUser.servers.split(';');
        if (spServers.includes(server)) {
          // Already know they are in that server
          // No real need to update it. Maybe update roles?
          if (oldUser.status == 'appealed') {
            // User WAS appealed, now permblacklisted
            execute('UPDATE users SET last_username = ?, status = ? WHERE userid = ?', [
              lastuser,
              'permblacklisted',
              userID,
            ])
              .then((results) => {
                func.globalFindAndCheck(userID);
                return callback(usertype, lastuser, userID);
              })
              .catch(console.error);
          } else return callback();
        } else {
          // New Server
          spServers.push(server);
          if (oldUser.status == 'appealed') {
            // User WAS appealed, now permblacklisted
            execute('UPDATE users SET last_username = ?, servers = ?, roles = ?, status = ? WHERE userid = ?', [
              lastuser,
              spServers.join(';'),
              newRoles,
              'permblacklisted',
              userID,
            ])
              .then((results) => {
                func.globalFindAndCheck(userID);
                return callback(usertype, lastuser, userID, true);
              })
              .catch(console.error);
          } else {
            execute('UPDATE users SET last_username = ?, servers = ?, roles = ? WHERE userid = ?', [
              lastuser,
              spServers.join(';'),
              newRoles,
              userID,
            ])
              .then((results) => {
                func.globalFindAndCheck(userID);
                return callback(usertype, lastuser, userID, false);
              })
              .catch(console.error);
          }
        }
      }
    });
  },

  addUserToDBMan: function (userID, status, usertype, server, reason, callback) {
    // Function for an admin to manually add a user to the database

    func.getUserFromDB(userID, function (oldUser) {
      if (!oldUser) {
        // User Does not exist, so add user
        bot
          .getRESTUser(userID)
          .then((rUser) => {
            // Good REST
            execute(
              'INSERT INTO USERS (avatar, last_username, userid, status, user_type, servers, reason, filter_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
              [
                rUser.avatarURL,
                `${rUser.username}#${rUser.discriminator}`,
                userID,
                status,
                usertype,
                server,
                reason,
                'Manual',
              ]
            )
              .then((results) => {
                func.globalFindAndCheck(userID);
                return callback(`Added <@${userID}> / ${userID} to database as ${status} with REST`);
              })
              .catch(console.error);
          })
          .catch((err) => {
            // Bad REST
            console.log(userID, status, usertype, server, reason);
            execute(
              'INSERT INTO users (userid, status, user_type, servers, reason, filter_type) VALUES (?, ?, ?, ?, ?, ?)',
              [userID, status, usertype, server, reason, 'Manual']
            )
              .then((results) => {
                func.globalFindAndCheck(userID);
                return callback(`Added <@${userID}> / ${userID} to database as ${status}`);
              })
              .catch(console.error);
          });
      } else {
        // User Already in Database
        return callback(
          `:shield: User is already in database.\nChange status if necessary using ${config.spc} upstatus`
        );
      }
    });
  },

  updateUserStatus: function (userID, newStatus, newType, newReason, callback) {
    // Update the status of a user in the database

    // First check the database for the user
    func.getUserFromDB(userID, function (oldUser) {
      if (!oldUser) {
        return callback(':shield: User not found in database');
      } else {
        // Existing User
        if (newType === undefined) {
          newType = oldUser.user_type;
        }
        execute('UPDATE users SET status = ?, user_type = ?, reason = ? WHERE userid = ?', [
          newStatus,
          newType,
          newReason,
          userID,
        ])
          .then((results) => {
            return callback(
              `Updated ${oldUser.last_username} <@${userID}> to status \`${newStatus}\`, type \`${newType}\` with reason: \`${newReason}\``
            );
          })
          .catch(console.error);
      }
    });
  },

  anonymizeUser: function (userID, callback) {
    // Anonymize a user in the database

    // Check user exists
    func.getUserFromDB(userID, function (oldUser) {
      if (!oldUser) {
        // Return Nothing
        return callback(':shield: User not found in database');
      } else {
        // Existing User
        // Set Default Values

        let avatar = 'https://discord.com/assets/6debd47ed13483642cf09e832ed0bc1b.png';
        let username = 'unknown#0000';
        let servers = '860760302227161118';
        let roles = '';

        execute('UPDATE users SET avatar = ?, last_username = ?, servers = ?, roles = ? WHERE userid = ?', [
          avatar,
          username,
          servers,
          roles,
          userID,
        ])
          .then((results) => {
            return callback(`Anonymized ${oldUser.last_username} <@${userID}>`);
          })
          .catch(console.error);
      }
    });
  },

  CSVtoArray: function (text) {
    let re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    let re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    let a = []; // Initialize array to receive values.
    text.replace(
      re_value, // "Walk" the string using replace with callback.
      function (m0, m1, m2, m3) {
        // Remove backslash from \' in single quoted values.
        if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        // Remove backslash from \" in double quoted values.
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return ''; // Return empty string.
      }
    );

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
  },

  processCSVImport: async function (filename, serverid, utype, callback) {
    if (processState === undefined) {
      processState = 'import';

      let blacklistCount = 0;
      let permaCount = 0;

      const rl = readline.createInterface({
        input: fs.createReadStream(filename + '.csv'),
        crlfDelay: Infinity,
      });
      // Note: we use the crlfDelay option to recognize all instances of CR LF
      // ('\r\n') in input.txt as a single line break.

      const processLines = async () => {
        for await (const line of rl) {
          // Each line in input.txt will be successively available here as `line`.
          let lineArr = func.CSVtoArray(line);
          if (lineArr != null) {
            if (lineArr[0] != 'username') {
              await new Promise((r) => {
                func.addUserToDB(
                  lineArr[7], // UserID
                  lineArr[2], // Avatar
                  'blacklisted', // Status
                  utype, // User Type
                  lineArr[0] + `#${lineArr[1]}`, // Username
                  serverid, // Server ID
                  lineArr[3], // Roles
                  'Semi-Auto', // Filter Type
                  function (usertype, lastuser, userID, newServer) {
                    if (usertype) {
                      blacklistCount++;
                      if (usertype === 'permblacklisted') {
                        permaCount++;
                        if (newServer) {
                          bot.createMessage(config.logChannel, {
                            embed: {
                              description: `:shield: Updated status for ${lastuser} ${userID} to type "${usertype}".`,
                              color: 0x800000,
                            },
                          });
                        }
                      }
                    }
                    r();
                  }
                );
              });
            }
          }
        }
      };
      await processLines();
      bot.createMessage(config.addUsersChan, {
        embed: {
          description: `:shield: Completed user imports for ${badservers[serverid]} (${serverid}).\n+ ${blacklistCount} users have been added as ${utype}s.\n+ ${permaCount} users were permanently blacklisted.`,
          color: 0x800000,
        },
      });
      func.processStatus('done');
      return callback(true);
    } else {
      return callback(processState);
    }
  },

  getGuildSettings: function (guildID, callback) {
    // Gets the guild settings from the database
    execute('SELECT * FROM guilds WHERE guildid = ?', [guildID])
      .then((results) => {
        if (results && results[0]) {
          // Found in DB
          return callback(results[0]);
        } else {
          // Doesn't exist
          return callback();
        }
      })
      .catch(console.error);
  },

  addGuildToDB: function (guildID, guildName, logChannel) {
    // Adds a guild row to the database
    execute(
      'INSERT INTO guilds (guildid, guildname, logchan) VALUES (:id, :name, :chan) ON DUPLICATE KEY UPDATE guildname = :name',
      { id: guildID, name: guildName, chan: logChannel }
    );
  },

  removeGuildFromDB: function (guildID) {
    // Removes a guild row from the database
    execute('DELETE FROM guilds WHERE guildid = ?', [guildID]);
  },

  changeGuildSetting: function (guildID, guildOpt, guildVal, callback) {
    // Changes a guild setting
    let guildOptions = {
      punown: ['kick', 'ban'],
      punsupp: ['kick', 'ban'],
      punleak: ['warn', 'kick', 'ban'],
      puncheat: ['warn', 'kick', 'ban'],
    };
    if (guildOpt === 'logchan') {
      func.getGuildSettings(guildID, function (guildInfo) {
        if (!guildInfo) {
          return callback(':shield: Guild settings not found!\nPlease let the bot developer know.');
        } else {
          execute('UPDATE guilds SET logchan = ? WHERE guildid = ?', [guildVal, guildID])
            .then((results) => {
              return callback(`Changed setting \`${guildOpt}\` to \`${guildVal}\``);
            })
            .catch(console.error);
        }
      });
    } else if (guildOpt === 'prefix') {
      func.getGuildSettings(guildID, function (guildInfo) {
        if (!guildInfo) {
          return callback(':shield: Guild settings not found!\nPlease let the bot developer know.');
        } else {
          execute('UPDATE guilds SET prefix = ? WHERE guildid = ?', [guildVal, guildID])
            .then((results) => {
              return callback(`Changed setting \`${guildOpt}\` to \`${guildVal}\``);
            })
            .catch(console.error);
        }
      });
    } else if (guildOptions[guildOpt] != null) {
      if (guildOptions[guildOpt].includes(guildVal)) {
        func.getGuildSettings(guildID, function (guildInfo) {
          if (!guildInfo) {
            return callback(':shield: Guild settings not found!\nPlease let the bot developer know.');
          } else {
            execute(`UPDATE guilds SET ${guildOpt} = ? WHERE guildid = ?`, [guildVal, guildID])
              .then((results) => {
                return callback(`Changed setting \`${guildOpt}\` to \`${guildVal}\``);
              })
              .catch(console.error);
          }
        });
      } else {
        return callback(
          `:shield: You cannot set that option to that value.\nSetting not applied.\nPlease review \`${config.spc} config\` again for the allowed values per setting`
        );
      }
    } else {
      return callback(
        `:shield: You cannot set that option to that value.\nSetting not applied.\nPlease review \`${config.spc} config\` again for the allowed values per setting`
      );
    }
  },

  punishUser: function (member, guildInfo, olduser, toDM) {
    // Process a Bad User
    let type = olduser.user_type;
    let count = olduser.servers.split(';').length;
    let types = {
      owner: 'punown',
      supporter: 'punsupp',
      cheater: 'puncheat',
      leaker: 'punleak',
    };

    if (guildInfo[types[type]] == 'ban' || guildInfo[types[type]] == 'kick') {
      // Punishing User
      if (!member.bot) {
        if (toDM) {
          bot
            .getDMChannel(member.id)
            .then((channel) =>
              channel.createMessage(
                `:shield: Warden\nYou are being automodded by ${guildInfo.guildname} for being associated with ${count} Leaking or Cheating Discord Servers.\nYou may attempt to appeal this via the Official Warden Discord:\nhttps://discord.gg/jeFeDRasfs`
              )
            )
            .catch((err) => {
              bot
                .createMessage(guildInfo.logchan, {
                  embed: {
                    description: `:warning: Unable to Direct Message User <@${member.id}>`,
                    author: {
                      name: `${member.username}#${member.discriminator} / ${member.id}`,
                      icon_url: member.avatarURL,
                    },
                    color: 0xffff00,
                  },
                })
                .catch((err) => {});
            })
            .finally((any) => {
              let action =
                guildInfo[types[type]] == 'ban'
                  ? member[guildInfo[types[type]]](0, `Warden - User Type ${type}`)
                  : member[guildInfo[types[type]]](`Warden - User Type ${type}`);
              action
                .then((any) => {
                  bot
                    .createMessage(guildInfo.logchan, {
                      embed: {
                        description: `:shield: User <@${member.id}> has been punished with a ${
                          guildInfo[types[type]]
                        } on join.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${
                          olduser.status
                        } / **User Type**: ${type}.\n**Details**: ${olduser.reason}`,
                        author: {
                          name: `${member.username}#${member.discriminator} / ${member.id}`,
                          icon_url: member.avatarURL,
                        },
                        color: 0x008000,
                      },
                    })
                    .catch((err) => {});
                })
                .catch((err) => {
                  bot
                    .createMessage(guildInfo.logchan, {
                      embed: {
                        description: `:warning: I tried to ${guildInfo[types[type]]} <@${
                          member.id
                        }> but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                        author: {
                          name: `${member.username}#${member.discriminator} / ${member.id}`,
                          icon_url: member.avatarURL,
                        },
                        color: 0x008000,
                      },
                    })
                    .catch((err) => {});
                });
            });
        } else {
          let action =
            guildInfo[types[type]] == 'ban'
              ? member[guildInfo[types[type]]](0, `Warden - User Type ${type}`)
              : member[guildInfo[types[type]]](`Warden - User Type ${type}`);
          action
            .then((any) => {
              bot
                .createMessage(guildInfo.logchan, {
                  embed: {
                    description: `:shield: User <@${member.id}> has been punished with a ${
                      guildInfo[types[type]]
                    } on scan.\nThey have been seen in ${count} bad discord servers.\n**User Status**: ${
                      olduser.status
                    } / **User Type**: ${type}.\n**Details**: ${olduser.reason}`,
                    author: {
                      name: `${member.username}#${member.discriminator} / ${member.id}`,
                      icon_url: member.avatarURL,
                    },
                    color: 0x008000,
                  },
                })
                .catch((err) => {});
            })
            .catch((err) => {
              bot
                .createMessage(guildInfo.logchan, {
                  embed: {
                    description: `:warning: I tried to ${guildInfo[types[type]]} <@${
                      member.id
                    }> but something errored!\nPlease verify I have this permission, and am a higher role than this user!`,
                    author: {
                      name: `${member.username}#${member.discriminator} / ${member.id}`,
                      icon_url: member.avatarURL,
                    },
                    color: 0x008000,
                  },
                })
                .catch((err) => {});
            });
        }
      }
    } else if (guildInfo[types[type]] == 'warn') {
      // Warn Discord
      if (!member.bot) {
        bot
          .createMessage(guildInfo.logchan, {
            embed: {
              description: `:warning: User <@${member.id}> has been seen in ${count} bad discord servers.\n**User Status**: ${olduser.status} / **User Type**: ${type}.\n**Details**: ${olduser.reason}`,
              author: {
                name: `${member.username}#${member.discriminator} / ${member.id}`,
                icon_url: member.avatarURL,
              },
              color: 0x008000,
            },
          })
          .catch((err) => {});
      }
    }
  },

  globalFindAndCheck: function (userID) {
    func.getUserFromDB(userID, function (oldUser) {
      if (oldUser) {
        // User Exists, Process
        let block = ['blacklisted', 'permblacklisted'];
        if (block.includes(oldUser.status)) {
          // User is Blacklisted
          bot.guilds.forEach((_, guildID) => {
            const guild = bot.guilds.get(guildID.toString());
            const member = guild.members.get(userID);
            if (typeof member !== 'undefined') {
              func.getGuildSettings(guildID.toString(), function (guildInfo) {
                func.punishUser(member, guildInfo, oldUser.user_type, false);
              });
            }
          });
        }
      }
    });
  },
};

module.exports = {
  func: func,
  pool: pool,
  execute: execute,
};
