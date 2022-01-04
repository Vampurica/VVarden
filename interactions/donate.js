// donate

let donate = function (interaction, load) {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'donate',
      description: 'Shares information on how to donate.',
      options: [],
    });
  } else {
    interaction.createMessage({
      embeds: [
        {
          title: 'Donate',
          description:
            "If you would like to donate to me, or the community that created Warden, you can do so via Ko-Fi.\nDonations don't get you anything except for a thank you message in the donations channel of the discord.\nDonations made will be used to upkeep the bots and offset living costs of the creators and maintainers.\n\n**Ko-Fi**: <https://ko-fi.com/vampuric>",
          color: 0x008000,
          footer: {
            text: 'VVarden by Vampire#8144',
          },
        },
      ],
    });
  }
};

module.exports = donate;
