// Rank

let rank = function (interaction, load) {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'rank',
      description: 'Responds with your bot command rank.',
      options: [],
    });
  } else {
    if (dev.includes(interaction.member.id)) {
      interaction.createMessage({
        embeds: [
          {
            description: interaction.member.mention + ' Your wish is my command **Bot Owner**!',
            color: 0x008000,
          },
        ],
      });
    } else if (admin.includes(interaction.member.id)) {
      interaction.createMessage({
        embeds: [
          {
            description: interaction.member.mention + ' Your wish is my command **Bot Admin**!',
            color: 0x008000,
          },
        ],
      });
    } else if (msg.member.permissions.has('administrator')) {
      interaction.createMessage({
        embeds: [
          {
            description: `${interaction.member.mention} Your wish is my command **Discord Admin**!`,
            color: 0x008000,
          },
        ],
      });
    } else if (interaction.member.id == '102498921640640512') {
      interaction.createMessage({
        embeds: [
          {
            description: `${interaction.member.mention} You're looking great today Leah. Let me know what you need.`,
            color: 0x008000,
          },
        ],
      });
    } else if (interaction.member.id == '160347445711077376') {
      interaction.createMessage({
        embeds: [
          {
            description: `${interaction.member.mention} What is thy bidding, my master?`,
            color: 0x008000,
          },
        ],
      });
    } else {
      interaction.createMessage({
        embeds: [
          {
            description: `${interaction.member.mention} You are a **Bot User**!`,
            color: 0x008000,
          },
        ],
      });
    }
  }
};

module.exports = rank;
