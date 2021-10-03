// About

let about = function () {
  bot.registerCommand(
    'about',
    (msg, args) => {
      bot.createMessage(msg.channel.id, {
        embed: {
          title: 'About Me',
          description:
            "Hello, my name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nI was created by Vampire#8144 in an effort to combat the prevalence of pirated code and cheating in the FiveM community, commonly called 'leaks' and 'hacks/cheats'.\n\nI am the frontend for a database of users in Leaking and Cheating Discord servers, with settings to prevent those users from entering your discord server.\n\nI am coded using the 'Eris' package for 'NodeJS'.\n<https://github.com/abalabahaha/eris>\n\nYou can join the Official Discord for more information: <https://discord.gg/jeFeDRasfs>",
          color: 0x008000,
          footer: {
            // Footer text
            text: 'VVarden by Vampire#8144',
          },
        },
      });
    },
    {
      description: 'About this bot',
      fullDescription: 'Information about this bot, its purpose, and author.',
      usage: 'about',
    }
  );
};

module.exports = about;
