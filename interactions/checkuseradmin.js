const { func } = require('../functions.js');
const badservers = require('../badservers.js');
const util = require('../utils.js');

// Checkuseradmin
let checkuser = async (interaction, load) => {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'checkuseradmin',
      description: 'Checks a users database status (for admins).',
      options: [
        {
          name: 'userid',
          description: 'UserID of the Member to Check',
          required: false,
          type: 3,
        },
        {
          name: 'user',
          description: 'Member to Check',
          required: false,
          type: 6,
        },
        {
          name: 'hidden',
          description: 'Hide the bot response?',
          required: false,
          type: 5,
        },
      ],
    });
  } else {
    if (admin.includes(interaction.member.id)) {
      if (interaction.data.options.length > 0) {
        // Requires Args
        let args = {};

        interaction.data.options.forEach((el) => {
          args[el.name] = el.value;
        });

        if (args.user != null) {
          // User Should be Resolved
          let userID = args.user;
          let userInfo = await func.getUserFromDB(userID);

          if (!userInfo) {
            // Not In Database
            let resp = {
              embeds: [
                {
                  description:
                    ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                  color: 0xffff00,
                },
              ],
            };

            if (args.hidden) {
              resp['flags'] = 64;
            }
            interaction.createMessage(resp);
          } else {
            // In Database
            let roles = userInfo.roles.split(';').join(',\n');
            if (roles == '') {
              roles = 'None';
            }
            let sids = userInfo.servers.split(';');
            let servers = [];
            sids.forEach((element) => {
              if (badservers[element] != null) {
                servers.push(badservers[element]);
              } else {
                servers.push(element);
              }
            });

            let resp = {
              embeds: [
                {
                  title: ':shield: User In Database',
                  description: `<@${userInfo.userid}> has been seen in ${
                    userInfo.servers.split(';').length
                  } bad Discord servers.`,
                  author: {
                    name: userInfo.last_username,
                    icon_url: userInfo.avatar,
                  },
                  thumbnail: { url: userInfo.avatar },
                  color: 0xffff00,
                  fields: [
                    // Array of field objects
                    {
                      name: 'User Information', // Field
                      value: `**ID**: ${userInfo.userid} / **Name**: ${userInfo.last_username}`,
                      inline: false, // Whether you want multiple fields in same line
                    },
                    {
                      name: 'Known Discord Roles',
                      value: roles.substring(0, 1024),
                      inline: false,
                    },
                    {
                      name: 'Known Servers',
                      value: servers.join(',\n').substring(0, 1024),
                      inline: false,
                    },
                    {
                      name: 'Database Information',
                      value: `**User Status**: ${userInfo.status}\n**User Type**: ${userInfo.user_type}\n**Details**: ${userInfo.reason}`,
                      inline: false,
                    },
                    {
                      name: `Added Type: ${userInfo.filter_type}`,
                      value: `**Date Added**: ${func.date(userInfo.added_date)}`,
                      inline: false,
                    },
                  ],
                  footer: {
                    // Footer text
                    text: 'VVarden by Vampire#8144',
                  },
                },
              ],
            };

            if (args.hidden) {
              resp['flags'] = 64;
            }
            interaction.createMessage(resp);
          }
        } else {
          // UserID Problably
          if (!isNaN(args.userid)) {
            // UserID Evals as Number
            let userID = args.userid;
            let userInfo = await func.getUserFromDB(userID);

            if (!userInfo) {
              // Not In Database
              let resp = {
                embeds: [
                  {
                    description:
                      ':white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.',
                    color: 0xffff00,
                  },
                ],
              };

              if (args.hidden) {
                resp['flags'] = 64;
              }
              interaction.createMessage(resp);
            } else {
              // In Database
              let roles = userInfo.roles.split(';').join(',\n');
              if (roles == '') {
                roles = 'None';
              }
              let sids = userInfo.servers.split(';');
              let servers = [];
              sids.forEach((element) => {
                if (badservers[element] != null) {
                  servers.push(badservers[element]);
                } else {
                  servers.push(element);
                }
              });

              let resp = {
                embeds: [
                  {
                    title: ':shield: User In Database',
                    description: `<@${userInfo.userid}> has been seen in ${
                      userInfo.servers.split(';').length
                    } bad Discord servers.`,
                    author: {
                      name: userInfo.last_username,
                      icon_url: userInfo.avatar,
                    },
                    thumbnail: { url: userInfo.avatar },
                    color: 0xffff00,
                    fields: [
                      // Array of field objects
                      {
                        name: 'User Information', // Field
                        value: `**ID**: ${userInfo.userid} / **Name**: ${userInfo.last_username}`,
                        inline: false, // Whether you want multiple fields in same line
                      },
                      {
                        name: 'Known Discord Roles',
                        value: roles.substring(0, 1024),
                        inline: false,
                      },
                      {
                        name: 'Known Servers',
                        value: servers.join(',\n').substring(0, 1024),
                        inline: false,
                      },
                      {
                        name: 'Database Information',
                        value: `**User Status**: ${userInfo.status}\n**User Type**: ${userInfo.user_type}\n**Details**: ${userInfo.reason}`,
                        inline: false,
                      },
                      {
                        name: `Added Type: ${userInfo.filter_type}`,
                        value: `**Date Added**: ${func.date(userInfo.added_date)}`,
                        inline: false,
                      },
                    ],
                    footer: {
                      // Footer text
                      text: 'VVarden by Vampire#8144',
                    },
                  },
                ],
              };

              if (args.hidden) {
                resp['flags'] = 64;
              }
              interaction.createMessage(resp);
            }
          } else {
            // Not a valid number
            interaction.createMessage({
              embeds: [
                {
                  description: 'CheckUser Requires a valid User or UserID.',
                  color: 0x800000,
                },
              ],
              flags: 64,
            });
          }
        }
      } else {
        interaction.createMessage({
          embeds: [
            {
              description: 'CheckUser Requires a User or UserID.',
              color: 0x800000,
            },
          ],
          flags: 64,
        });
      }
    } else {
      interaction.createMessage({
        embeds: [
          {
            description: 'You must be a BOT ADMIN to use this command.\nMaybe try `checkuser` instead?',
            color: 0x800000,
          },
        ],
        flags: 64,
      });
    }
  }
};

module.exports = checkuser;
