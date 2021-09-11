/*
    5 Warden Discord Bot by Vampire#8144 (VVarden)
    Using ERIS for Discord
*/

// INCLUDES AND CONFIGS
global.config     = require("./config.js");
global.util       = require("./utils.js");
global.func       = require("./functions.js");
global.badservers = require("./badservers.js");
const Eris        = require("eris");
global.fs         = require("fs");
global.readline   = require("readline");
const winston     = require("winston");
const config 	  = require("./config.js");

const logger = winston.createLogger({
	transports: [
		new winston.transports.File({
			level: "info",
			timestamp: true,
			filename: "botinfo.log"
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
			level: "info",
			message: logMess["stack"]
		});
		bot.createMessage(
			config.devLogChannel,
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
			level: "info",
			message: logMess.toString()
		});
		bot.createMessage(
			config.devLogChannel,
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

};

// MAIN CODE BODY
global.bot = new Eris.CommandClient(config.token, {
	getAllUsers: true,
	intents:[
		"guildMembers",
		"guildMessages",
		/*"guildMessageReactions",*/
		"guilds"
	],
	restMode: true,
	maxShards: "auto"
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
	func.getGuildPrefixes(function(guilds) {
		let exists = [];
		bot.guilds.forEach((value, key) => {
			Object.keys(guilds).some((k) => {
				if (guilds[k] && guilds[k].guildid === key) {
					//console.log("Setting "+value.name+" prefix to "+guilds[k].prefix+"")
					bot.registerGuildPrefix(key, guilds[k].prefix);
					guilds[k] = undefined;
					exists.push(key);
				}
			});
			if (exists.indexOf(key) == -1) {
				logMaster("Bot is in an unknown guild?\n<"+key+"> "+value.name+"\n\nSave me Vampire!");
			}
		});
	});
});

bot.on("shardReady", (id) => {
	logMaster(`Shard #${id + 1} launched!`);
});

bot.on("error", (err) => {
	// This error is normal, as Discord resets bot connections occasionally
	if (!err["message"].includes("Connection reset by peer")) {
		logMaster(err);
	}
});

// Hidden command for code testing
bot.registerCommand("test", (msg, args) => {
	try {



	} catch (err) {
		console.log(err["stack"].toString());
	}

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
	let guildCreate = require("./events/guildCreate.js");
	guildCreate(guild);
});

bot.on("guildMemberAdd", (guild, member) => {
	let guildMemberAdd = require("./events/guildMemberAdd.js");
	guildMemberAdd(guild, member);
});

// Command Handling
let chelp = require("./commands/help.js")();
let cabout = require("./commands/about.js")();
let cping = require("./commands/ping.js")();
let crank = require("./commands/rank.js")();
let cstatus = require("./commands/status.js")();
let cscanusers = require("./commands/scanusers.js")();
let cprocfile = require("./commands/procfile.js")();
let ccheckuser = require("./commands/checkuser.js")();
let ccheckuseradmin = require("./commands/checkuseradmin.js")();
let cupstatus = require("./commands/upstatus.js")();
let cadduser = require("./commands/adduser.js")();
let cconfig = require("./commands/config.js")();
let cinvite = require("./commands/invite.js")();
let cforcecheck = require("./commands/forcecheck.js")();
let cdonate = require("./commands/donate.js")();

// CONNECT AND INTERVALS
bot.connect().catch(err => {});

setInterval(func.randomStatus, 5000);