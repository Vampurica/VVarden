/*
    5 Warden Discord Bot by Vampire#8144 (VVarden)
    Using ERIS for Discord
*/
// Inject environment variables
require('dotenv').config()

// INCLUDES AND CONFIGS
const config = require('./config.js');
const { func, execute } = require('./functions.js');
const Eris = require('eris');
const fs = require('fs');
const winston = require('winston');
const express = require('express')
const app = express()

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
      level: 'info',
      timestamp: true,
      filename: 'botinfo.log',
    }),
  ],
});

// Logging Wrapper
global.logMaster = function (logMess) {
  if (typeof logMess == 'object') {
    console.log(logMess['stack']);
    logger.info({
      level: 'info',
      message: logMess['stack'],
    });
    bot.createMessage(config.logChannel, {
      embed: {
        description: logMess['stack'],
        color: 0x800000,
        footer: {
          // Footer text
          text: Date(Date.now()).toLocaleString().slice(0, 24),
        },
      },
    });
  } else {
    console.log(logMess.toString());
    logger.info({
      level: 'info',
      message: logMess.toString(),
    });
    bot.createMessage(config.logChannel, {
      embed: {
        description: logMess.toString(),
        color: 0x800000,
        footer: {
          // Footer text
          text: Date(Date.now()).toLocaleString().slice(0, 24),
        },
      },
    });
  }
};

// MAIN CODE BODY
global.bot = new Eris.CommandClient(
  process.env.BOT_TOKEN,
  {
    getAllUsers: true,
    rateLimitPerUser: 2,
    intents: [
      'guildMembers',
      'guildMessages',
      /*"guildMessageReactions",*/
      'guilds',
    ],
    restMode: true,
    maxShards: 4,
  },
  {
    description: 'A discord bot that cross-references people in bad discords',
    owner: 'Vampire#8144',
    prefix: config.spc,
    defaultHelpCommand: false,
  }
);

bot.on('ready', () => {
  console.log('Logged into Discord!');
  bot.editStatus('online', {
    name: 'Boot Up Noises!',
    type: 0,
  });

  // Build Prefixes
  execute('SELECT guildid, prefix FROM guilds')
    .then((guilds) => {
      let exists = [];
      bot.guilds.forEach((value, guildid) => {
        Object.keys(guilds).some((k) => {
          if (guilds[k] && guilds[k].guildid === guildid) {
            bot.registerGuildPrefix(guildid, guilds[k].prefix);
            guilds[k] = undefined;
            exists.push(guildid);
          }
        });
        if (exists.indexOf(guildid) == -1) {
          logMaster(`Bot is in an unknown guild?\n<${guildid}> ${value.name}\n\nSave me Vampire!`);
        }
      });
    })
    .catch(console.error);
    
    // API Setup (https://firewall.hyperz.net)
    app.listen(config.port || 3000)
    app.get('/firewallgg/checkuser/:userid', async function(req, res) {
        if(req?.headers?.wardenauth !== config.apiSecret) return res.send("Invalid authorization code in API header request.");
        if(!req?.params?.userid) return res.redirect('/');
        req.params.userid == req.params.userid.replaceAll('`', '').replaceAll('"', '');
        execute(`SELECT * FROM users WHERE userid="${req?.params?.userid}"`)
        .then((users) => {
            if(err) throw err;
            if(!users[0]) {
                // If the user is not in the database
                let json_ = {
                    "active": false, // This means that the user is not banned
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            } else {
                // If the user is in the database
                let json_ = {
                    "active": true,
                    "userid": users[0].userid,
                    "reason": users[0].reason,
                    "proof": 'None provided...',
                    "time": users[0].added_date
                }
                return res.type('json').send(JSON.stringify(json_, null, 4) + '\n');
            };
        });
    }).catch(console.error);
});

bot.on('shardReady', (id) => {
  logMaster(`Shard #${id + 1} launched!`);
});

bot.on('error', (err) => {
  // This error is normal, as Discord resets bot connections occasionally
  if (!err['message'].includes('Connection reset by peer')) {
    logMaster(err);
  }
});

// Events
const guildCreate = require('./events/guildCreate.js');
bot.on('guildCreate', (guild) => {
  guildCreate(guild);
});

const guildMemberAdd = require('./events/guildMemberAdd.js');
bot.on('guildMemberAdd', (guild, member) => {
  guildMemberAdd(guild, member);
});

// bot.registerCommand(
//   "test",
//   (msg, args) => {
//     try {
//     } catch (err) {
//       console.log(err["stack"].toString());
//     }
//   },
//   {
//     requirements: {
//       userIDs: dev,
//     },
//     description: "Test",
//     fullDescription: "For Testing",
//     usage: "test for testing",
//     hidden: true,
//   }
// );

// Command Handling
fs.readdirSync('./commands/').forEach((file) => {
  require(`./commands/${file}`)();
});

// CONNECT AND INTERVALS
bot.connect().catch((err) => {});
setInterval(func.randomStatus, 5000);
