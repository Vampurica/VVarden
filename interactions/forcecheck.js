const { func } = require('../functions.js');
const util = require('../utils.js');

// forcecheck
let forcecheck = function (interaction, load) {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'forcecheck',
      description: 'Checks the DB status of a user and global automods if needed.',
      options: [
        {
          name: 'userid',
          description: 'UserID of the Member to ForceCheck',
          required: false,
          type: 3,
        },
        {
          name: 'user',
          description: 'Member to ForceCheck',
          required: false,
          type: 6,
        },
      ],
    });
  } else {
    //let str = JSON.stringify(interaction.data, null, 4);
    //console.log(str);

    if (interaction.data.options.length > 0) {
      // Requires Args
      let args = {};

      interaction.data.options.forEach((el) => {
        args[el.name] = el.value;
      });

      if (args.user != null) {
        // User Mention - Should be Resolved
        let member = interaction.data.resolved.members[args.user];
        if (member != null) {
          // We resolved a member object
          func.globalFindAndCheck(member.id);

          interaction.createMessage({
            embeds: [
              {
                description: `Performing ForceCheck on ${
                  member.username + '#' + member.discriminator
                }\nIf they are blacklisted they will be automodded.`,
                color: 0xffff00,
              },
            ],
            flags: 64,
          });
        } else {
          // Member Object not resolved??? - Continue with userid
          let userid = args.user;

          func.globalFindAndCheck(userid);

          interaction.createMessage({
            embeds: [
              {
                description: `Performing ForceCheck on ${userid}\nIf they are blacklisted they will be automodded.`,
                color: 0xffff00,
              },
            ],
            flags: 64,
          });
        }
      } else {
        // UserID String
        if (!isNaN(args.userid)) {
          // Is valid number
          let userid = args.userid;

          func.globalFindAndCheck(userid);

          interaction.createMessage({
            embeds: [
              {
                description: `Performing ForceCheck on ${userid}\nIf they are blacklisted they will be automodded.`,
                color: 0xffff00,
              },
            ],
            flags: 64,
          });
        } else {
          // Invalid number
          interaction.createMessage({
            embeds: [
              {
                description: 'Please submit a valid UserID for ForceCheck.',
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
            description: 'ForceCheck Requires a User or UserID.',
            color: 0x800000,
          },
        ],
        flags: 64,
      });
    }
  }
};

module.exports = forcecheck;
