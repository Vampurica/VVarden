const { func } = require('../functions.js');
const util = require('../utils.js');

// Checkuser
let checkuser = async (interaction, load) => {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'checkuser',
      description: 'Checks a users database status.',
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
          let badType = ['blacklisted', 'permblacklisted'];
          if (badType.includes(userInfo.status)) {
            let resp = {
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
                    // Array of field objects
                    {
                      name: 'User Information', // Field
                      value: `**ID**: ${userInfo.userid} / **Name**: ${userInfo.last_username}`,
                      inline: false, // Whether you want multiple fields in same line
                    },
                    {
                      name: 'Blacklist Reason',
                      value: `**User Type**: ${userInfo.user_type}\n**Details**: ${userInfo.reason}`,
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
          } else {
            // User is Good, so fake it
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
          }
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
            let badType = ['blacklisted', 'permblacklisted'];
            if (badType.includes(userInfo.status)) {
              let resp = {
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
                      // Array of field objects
                      {
                        name: 'User Information', // Field
                        value: `**ID**: ${userInfo.userid} / **Name**: ${userInfo.last_username}`,
                        inline: false, // Whether you want multiple fields in same line
                      },
                      {
                        name: 'Blacklist Reason',
                        value: `**User Type**: ${userInfo.user_type}\n**Details**: ${userInfo.reason}`,
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
            } else {
              // User is Good, so fake it
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
            }
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
  }
};

module.exports = checkuser;
