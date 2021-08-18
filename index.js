/*
    5 Warden Discord Bot by Vampire#8144 (VVarden)
    Using ERIS for Discord
*/

// INCLUDES AND CONFIGS
global.config     = require('./config.js');
global.util       = require('./utils.js');
global.func       = require('./functions.js')
global.badservers = require('./badservers.js');
const Eris        = require("eris");
global.fs         = require('fs');
global.readline   = require('readline');
const winston     = require('winston');
const mysql       = require('mysql');
global.pool  = mysql.createPool({
  connectionLimit : 20,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'vvarden',
  charset         : "utf8_general_ci"
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.File({
        level: 'info',
        timestamp: true,
        filename: 'botinfo.log'
    })
  ],
});

// DEFINITIONS AND VARIABLES
global.spc = config.specialChar;
global.admin = config.admin;
global.dev = "282199104996507650";

// Logging Wrapper
global.logMaster = function(logMess) {
	if (typeof logMess == "object") {
		console.log(logMess["stack"]);
		logger.info({
			level: 'info',
			message: logMess["stack"]
		});
		bot.createMessage(
			"861736808345370654",
			{
				embed: {
					description: logMess["stack"],
					color: 0x800000,
					footer: { // Footer text
						text: ""+Date(Date.now()).toLocaleString().slice(0,24)+""
					}
				}
			}
		);
	} else {
		console.log(logMess.toString());
		logger.info({
			level: 'info',
			message: logMess.toString()
		});
		bot.createMessage(
			"861736808345370654",
			{
				embed: {
					description: logMess.toString(),
					color: 0x800000,
					footer: { // Footer text
						text: ""+Date(Date.now()).toLocaleString().slice(0,24)+""
					}
				}
			}
		);
	}

}

// MAIN CODE BODY
global.bot = new Eris.CommandClient(config.token, {
    intents:[
        "guildMembers",
        "guildMessages",
        /*"guildMessageReactions",*/
        "guilds"
    ],
    restMode: true
},{
    description: "A discord bot that cross-references people in bad discords",
    owner: "Vampire#8144",
    prefix: config.specialChar,
    defaultHelpCommand: false
});

bot.on("ready", () => {
    console.log("Logged into Discord!");
    bot.editStatus(
        "online",
        {
            name:("Boot Up Noises!"),
            type:0
        }
    );

    // Build Prefixes
    bot.guilds.forEach((value, key) => {
        let guildID = key.toString();
        let guild = value;
        func.getGuildSettings(key.toString(), function (guildInfo) {
            if (guildInfo == "nores") {
                logMaster("Bot is in unknown guild???\n"+guild.id+" / "+guild.name+"\n\nSave me Vampire!!!");
            } else {
                //console.log("Setting "+guild.name+" prefix to "+guildInfo.prefix+"")
                bot.registerGuildPrefix(guild.id, guildInfo.prefix);
            }
        });
    });
});

bot.on("error", (err) => {
    // This error is normal, as Discord resets bot connections occasionally
    if (!err["message"].includes("Connection reset by peer")) {
        logMaster(err);
    }
});

// Hidden command for code testing
bot.registerCommand("test", (msg, args) => {
    bot.getRESTUser(args[0]).then(rUser => {
        logMaster("Got Rest Info");
    }).catch(err => {
        logMaster(err);
    });
},{
    requirements: {
        userIDs: [dev]
    },
    description: "Test",
    fullDescription: "For Testing",
    usage: "test for testing",
    hidden: true
});

// Events
bot.on("guildCreate", (guild) => {
    let guildCreate = require('./events/guildCreate.js');
    guildCreate(guild);
});

bot.on("guildMemberAdd", (guild, member) => {
    let guildMemberAdd = require('./events/guildMemberAdd.js');
    guildMemberAdd(guild, member);
});

// Command Handling
let chelp = require('./commands/help.js')();
let cabout = require('./commands/about.js')();
let cping = require('./commands/ping.js')();
let crank = require('./commands/rank.js')();
let cstatus = require('./commands/status.js')();
let cscanusers = require('./commands/scanusers.js')();
let cprocfile = require('./commands/procfile.js')();
let ccheckuser = require('./commands/checkuser.js')();
let ccheckuseradmin = require('./commands/checkuseradmin.js')();
let cupstatus = require('./commands/upstatus.js')();
let cadduser = require('./commands/adduser.js')();
let cconfig = require('./commands/config.js')();
let cinvite = require('./commands/invite.js')();


// CONNECT AND INTERVALS
bot.connect().catch(err => {});

setInterval(func.randomStatus, 5000);
