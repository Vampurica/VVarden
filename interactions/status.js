const { execute } = require('../functions.js');

// status
let status = function (interaction, load) {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'status',
      description: 'Shows bot status and stats about its services.',
      options: [],
    });
  } else {
    interaction.defer()

    execute("SELECT COUNT(*) FROM users WHERE status LIKE '%blacklisted%'").then((results) => {
      if (Object.values(results[0])[0] == 0) {
        // Doesn't exist?
      } else {
        // Found in DB
        let bCount = Object.values(results[0])[0];
        interaction.createMessage({
          embeds: [
            {
              title: ':desktop: Bot Status',
              color: 0x008000,
              fields: [
                {
                  name: 'Shard Count',
                  value: `I am using ${bot.shards.size} Shards`,
                  inline: false,
                },
                {
                  name: 'Protected Guilds',
                  value: `I am watching ${bot.guilds.size} Guilds`,
                  inline: false,
                },
                {
                  name: 'Blacklisted Accounts',
                  value: `I am blocking ${bCount} discord accounts.`,
                  inline: false,
                },
                {
                  name: 'Bot Uptime Since Last Restart',
                  value: `I have been up for ${Math.round((process.uptime() / 60) * 100) / 100} minutes`,
                  inline: false,
                },
                {
                  name: 'Memory Usage',
                  value: `I am currently using ${
                    Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100
                  } MB of RAM.`,
                  inline: false,
                },
              ],
              footer: {
                text: 'VVarden by Vampire#8144',
              },
            },
          ],
        });
      }
    });
  }
};

module.exports = status;
