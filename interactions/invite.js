// Invite Bot

let invite = function (interaction, load) {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'invite',
      description: 'Shows the bot invite link.',
      options: [],
    });
  } else {
    interaction.createMessage({
      embeds: [
        {
          title: 'Invite Me',
          description:
            'If you would like to invite me to your own discord, please visit this link:\n<https://discord.com/api/oauth2/authorize?client_id=874059310869655662&permissions=8&scope=bot%20applications.commands>\n\nI will need kick and ban permissions as well as a role higher than the users I am acting on.',
          color: 0x008000,
          footer: {
            // Footer text
            text: 'VVarden by Vampire#8144',
          },
        },
      ],
    });
  }
};

module.exports = invite;
