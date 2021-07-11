/*
    5 Warden Discord Bot by Vampire#8144 (VVarden)
    Using ERIS for Discord
*/
// INCLUDES AND CONFIGS
const config     = require('./config.js');
const badservers = require('./badservers.js');
const Eris       = require("eris");
const fs         = require('fs');
const readline   = require('readline');
const winston    = require('winston');
const mysql      = require('mysql');
let pool  = mysql.createPool({
  connectionLimit : 20,
  host            : 'localhost',
  user            : 'root',
  password        : '',
  database        : 'vvarden'
});

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
        colorize: true,
        level: 'debug'
    }),
    new winston.transports.File({
        level: 'info',
        timestamp: true,
        filename: 'botinfo.log',
        json: false
    })
  ],
});

// DEFINITIONS AND VARIABLES
global.spc = config.specialChar;
global.admin = config.admin.push("282199104996507650");
global.dev = "282199104996507650";

// UTIL FUNCTIONS
function logMaster(logMess) {
    logger.info(logMess);
    console.log(logMess);
    bot.createMessage(
        "861736808345370654",
        {
            embed: {
                description: logMess,
                color: 0x800000,
                footer: { // Footer text
                    text: ""+Date(Date.now()).toLocaleString().slice(0,24)+""
                }
            }
        }
    );
}

function selectRandom(arr) {
    // Selects a random element from an array
    let elem = arr[Math.floor(Math.random()*arr.length)];
    //logMaster("selectRandom: "+elem+"");
    return elem;
}

function stripID(mention) {
    // Takes a mention and strips the mentioned ID out of it
    let takeFirst = mention.slice(2);
    let cleanID = takeFirst.slice(0, takeFirst.length-1);
    let mblCheck = cleanID.slice(0,1);
    if (mblCheck == "!") {
        let cleanerID = cleanID.slice(1);
        //logMaster("stripID: "+cleanerID+"");
        return cleanerID;
    } else {
        //logMaster("stripID: "+cleanID+"");
        return cleanID;
    }
}

function stripChan(mention) {
    // Takes a mention and strips the mentioned chanID out of it
    let takeFirst = mention.slice(2);
    let cleanID = takeFirst.slice(0, takeFirst.length-1);

    return cleanID;
}

function arrIndex(needle, stack, callback) {
    // Gets the index of an element in an array
    //logMaster("arrIndex: "+needle+"");
    let count = stack.length;
    for(let i=0;i<count;i++)
    {
        if(stack[i]===needle){return callback(i);}
    }
    return false;
}

// MAIN CODE BODY
const bot = new Eris(config.token, {
    intents:[
        "guildMembers",
        "guildMessages",
        /*"guildMessageReactions",*/
        "guilds"
    ]
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
});

bot.on("error", (err) => {
    logMaster(err);
});

function randomStatus() {
    // Randomizes the bot status from the list
    let rStatus = [
        "Leakers | Use "+spc+"help",
        " Guilds",
        "Cheaters | Use "+spc+"help",
        "discord.gg/jeFeDRasfs"
    ];
    let newStatus = selectRandom(rStatus)
    if (newStatus.charAt(0) == " ") {
        // Add the number of guilds to the status that shows it
        // Would have done it above, but then it wouldn't update dynamically
        newStatus = bot.guilds.size + newStatus;
    }
    bot.editStatus(
        "online",
        {
            name:(newStatus),
            type:3
        }
    );
}

function combineRoles(oldRoles, newRoles) {
    // Takes a delimited role string and combines it, removing dupes
    let wipOldArr = oldRoles.split(";");
    let wipNewArr = newRoles.split(";")
    let combArr = wipOldArr.concat(wipNewArr.filter((item) => wipOldArr.indexOf(item) < 0))

    return combArr;
}

function getUserFromDB(userID, callback) {
    // Calls the database to get the row about the specified user.
    //logMaster("GetUserFromDB: "+userID+"")
    pool.query('SELECT EXISTS(SELECT 1 FROM users WHERE userid='+pool.escape(userID)+')', function (error, results, fields) {
        //logMaster("GetUserFromDB: "+Object.values(results[0])[0]+" and "+pool.escape(userID))
        if (error) throw error;
        if (Object.values(results[0])[0] == 0) {
            // Doesn't exist
            //logMaster("GetUserFromDB: NoRes")
            return callback("nores");
        } else {
            // Found in DB
            pool.query('SELECT * FROM users WHERE userid='+pool.escape(userID)+'', function (error, results, fields) {
                if (error) throw error;
                //logMaster("GetUserFromDB: ReturningRes")
                return callback(results[0]);
            });
        }
    });
}

function addUserToDB(userID, avatar, status, usertype, lastuser, server, roles, filtertype, callback) {
    // Adds the user to the database. Expected to be used by the automated system primarily

    // First check the database for the user
    getUserFromDB(userID, function (oldUser) {
        if (oldUser == "nores") {
            // Add New User
            pool.query('INSERT INTO users (userid, avatar, user_type, last_username, servers, roles, added_date) VALUES('+pool.escape(userID)+','+pool.escape(avatar)+','+pool.escape(usertype)+','+pool.escape(lastuser)+','+pool.escape(server)+','+pool.escape(roles)+',"'+(new Date())+'")', function(err, results, fields) {
                if (err) throw err;
            });
            return callback(":x: Auto Added "+usertype+" "+lastuser+" <@"+userID+"> into database from "+badservers[server]+"");
        } else {
            // Update Existing User
            let newRoles = combineRoles(oldUser.roles, roles).join(';');
            let spServers = oldUser.servers.split(";");
            if (spServers.includes(server)) {
                // Already know they are in that server
                // No real need to update it. Maybe update roles?
            } else {
                // New Server
                spServers.push(server);
                pool.query('UPDATE users SET last_username='+pool.escape(lastuser)+', servers='+pool.escape(spServers.join(';'))+', roles='+pool.escape(newRoles)+' WHERE userid='+pool.escape(userID)+'', function(err, results, fields) {
                    if (err) throw err;
                });
                return callback(":x: Auto Updated "+usertype+" "+lastuser+" <@"+userID+"> in database from "+badservers[server]+"");
            }
        }
    });
}

function addUserToDBMan(userID, status, usertype, lastuser, server, roles, filtertype, callback) {
    // Function for an admin to manually add a user to the database

    getUserFromDB(userID, function (oldUser) {
        if (oldUser == "nores") {
            // User Does not exist, so add user
            pool.query('INSERT INTO users (userid, status, user_type, last_username, servers, roles, added_date) VALUES('+pool.escape(userID)+','+pool.escape(status)+','+pool.escape(usertype)+','+pool.escape(lastuser)+','+pool.escape(server)+','+pool.escape(roles)+',"'+(new Date())+'")', function(err, results, fields) {
                if (err) throw err;
            });
            return callback("Added "+lastuser+" <@"+userID+"> to database as "+status+"");
        } else {
            // User Already in Database
            return callback(":x: User is already in database.\nChange status if necessary using "+spc+"upstatus");
        }
    });
}

function updateUserStatus(userID, newStatus, newReason, callback) {
    // Update the status of a user in the database

    // First check the database for the user
    getUserFromDB(userID, function (oldUser) {
        if (oldUser == "nores") {
            // Return Nothing
            return callback(":x: User not found in database");
        } else {
            // Existing User
            pool.query('UPDATE users SET status='+pool.escape(newStatus)+', reason='+pool.escape(newReason)+' WHERE userid='+pool.escape(userID)+'', function(err, results, fields) {
                if (err) throw err;
            });
            return callback("Updated "+oldUser.last_username+" <@"+userID+"> to status `"+newStatus+"` and `"+newReason+"`");
        }
    });
}

function CSVtoArray(text) {
    let re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    let re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;

    // Return NULL if input string is not well formed CSV string.
    if (!re_valid.test(text)) return null;

    let a = []; // Initialize array to receive values.
    text.replace(re_value, // "Walk" the string using replace with callback.
        function(m0, m1, m2, m3) {

            // Remove backslash from \' in single quoted values.
            if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));

            // Remove backslash from \" in double quoted values.
            else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
            else if (m3 !== undefined) a.push(m3);
            return ''; // Return empty string.
        });

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push('');
    return a;
};

async function processCSVImport(filename, serverid, utype, callback) {
    const fileStream = fs.createReadStream(filename+'.csv');
    //let add = 0;
    //let upd = 0;

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });
    // Note: we use the crlfDelay option to recognize all instances of CR LF
    // ('\r\n') in input.txt as a single line break.

    for await (const line of rl) {
        // Each line in input.txt will be successively available here as `line`.
        let lineArr = CSVtoArray(line)
        if (lineArr != null) {
            if (lineArr[0] != "username") {
                addUserToDB(
                    lineArr[7], // UserID
                    lineArr[2], // Avatar
                    "blacklisted", // Status
                    utype, // User Type
                    lineArr[0]+"#"+lineArr[1], // Username
                    serverid, // Server ID
                    lineArr[3], // Roles
                    "Semi-Auto", // Filter Type
                    function (ret) {
                        bot.createMessage(
                            config.addUsersChan,
                            {
                                embed: {
                                    description: ret,
                                    color: 0x800000,
                                }
                            }
                        );
                    }
                );
            }
        }
    }

    //logMaster("Added "+add+" users and updated "+upd+" users for the database from "+filename+".csv")
    return callback(true);
}

function getGuildSettings(guildID, callback) {
    // Gets the guild settings from the database
    pool.query('SELECT EXISTS(SELECT 1 FROM guilds WHERE guildid='+pool.escape(guildID)+')', function (error, results, fields) {
        if (error) throw error;
        if (Object.values(results[0])[0] == 0) {
            // Doesn't exist
            return callback("nores");
        } else {
            // Found in DB
            pool.query('SELECT * FROM guilds WHERE guildid='+pool.escape(guildID)+'', function (error, results, fields) {
                if (error) throw error;
                return callback(results[0]);
            });
        }
    });
}

function addGuildToDB(guildID, guildName, logChannel) {
    // Adds a guild row to the database
    pool.query('INSERT INTO guilds (guildid, guildname, logchan) VALUES ('+pool.escape(guildID)+','+pool.escape(guildName)+','+pool.escape(logChannel)+') ON DUPLICATE KEY UPDATE guildname='+pool.escape(guildName), function (error, results, fields) {
        if (error) throw error;
    });
}

function removeGuildFromDB(guildID) {
    // Removes a guild row from the database
    pool.query('DELETE FROM guilds WHERE guildid='+pool.escape(guildID)+'', function (error, results, fields) {
        if (error) throw error;
    });
}

function changeGuildSetting(guildID, guildOpt, guildVal, callback) {
    // Changes a guild setting
    let guildOptions = {
        "punown": ["kick","ban"],
        "punsupp": ["kick","ban"],
        "punleak": ["warn","kick","ban"],
        "puncheat": ["warn","kick","ban"]
    }
    if (guildOpt === "logchan") {
        getGuildSettings(guildID, function (guildInfo) {
            if (guildInfo == "nores") {
                return callback(":x: Guild settings not found!\nPlease let the bot developer know.");
            } else {
                pool.query('UPDATE guilds SET logchan='+pool.escape(guildVal)+' WHERE guildid='+pool.escape(guildID)+'', function (error, results, fields) {
                    if (error) throw error;
                    return callback("Changed setting "+pool.escape(guildOpt)+" to "+pool.escape(guildVal)+"");
                });
            }
        });
    } else if (guildOptions[guildOpt] != null) {
        if (guildOptions[guildOpt].includes(guildVal)) {
            getGuildSettings(guildID, function (guildInfo) {
                if (guildInfo == "nores") {
                    return callback(":x: Guild settings not found!\nPlease let the bot developer know.");
                } else {
                    pool.query('UPDATE guilds SET '+guildOpt+'='+pool.escape(guildVal)+' WHERE guildid='+pool.escape(guildID)+'', function (error, results, fields) {
                        if (error) throw error;
                        return callback("Changed setting "+pool.escape(guildOpt)+" to "+pool.escape(guildVal)+"");
                    });
                }
            });
        } else {
            return callback(":x: You cannot set that option to that value.\nSetting not applied.\nPlease review `"+spc+"config` again for the allowed values per setting");
        }
    } else {
        return callback(":x: You cannot set that option to that value.\nSetting not applied.\nPlease review `"+spc+"config` again for the allowed values per setting");
    }
}

bot.on("guildCreate", (guild) => {
    // Invited to New Guild
    logMaster("Joined New Guild "+guild.name+" with "+guild.memberCount+" members\nGuild Owner is <@"+guild.ownerID+"> "+guild.ownerID+"");
    addGuildToDB(guild.id, guild.name, guild.systemChannelID);
    bot.createMessage(
        guild.systemChannelID,
        {
            embed: {
                title: "Hello "+guild.name+"!",
                description: "My name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nThank you for inviting me to your Discord Server!\nI'm trying to make the CFX Community a better place.\n\nMake sure to check my configuration settings by using the `"+spc+"config` command!\nI also need to have the permissions to kick and ban members!\n\nI'm already acting on new member joins. Check "+spc+"help to do a scan of current users.\n\nIf you want to contribute to the project, use the official discord: discord.gg/jeFeDRasfs",
                color: 0x008000,
                footer: { // Footer text
                    text: "VVarden by Vampire#8144"
                }
            }
        }
    );
});

bot.on("guildMemberAdd", (guild, member) => {
    // Member Joined Guild, process blacklist
    // First get Guild Settings
    getGuildSettings(guild.id, function (guildInfo) {
        if (guildInfo == "nores") {
            logMaster("Bot is in unknown guild???\n"+guild.id+" / "+guild.name+"\n\nSave me Vampire!!!");
        } else {
            // Now Get Member Info
            getUserFromDB(member.id, function (oldUser) {
                if (oldUser == "nores") {
                    // User Does not exist, so do nothing I guess?
                    // Maybe in the future give a clean log
                } else {
                    // User Exists, Process
                    /*
                        punown = owner
                        punsupp = supporter
                        punleak = leaker
                        puncheat = cheater
                    */
                    switch(oldUser.user_type) {
                        case "owner":
                            if (guildInfo.punown == "kick") {
                                // Kick
                                member.kick("VVarden - Leaking or Cheating Discord Staff");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been kicked.\nLeaking or Cheating Discord Owner.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            } else {
                                // Ban
                                member.ban(0, "VVarden - Leaking or Cheating Discord Staff");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been banned.\nLeaking or Cheating Discord Owner.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            }
                            break;
                        case "supporter":
                            if (guildInfo.punsupp == "kick") {
                                // Kick
                                member.kick("VVarden - Leaking or Cheating Discord Supporter");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been kicked.\nLeaking or Cheating Discord Supporter.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            } else {
                                // Ban
                                member.ban(0, "VVarden - Leaking or Cheating Discord Supporter");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been banned.\nLeaking or Cheating Discord Supporter.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            }
                            break;
                        case "leaker":
                            if (guildInfo.punleak == "warn") {
                                // Warn
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":warning: User <@"+member.id+"> joined and has been in "+oldUser.servers.split(";").length+" leaking discords!",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x800000,
                                        }
                                    }
                                );
                            } else if (guildInfo.punleak == "kick") {
                                // Kick
                                member.kick("VVarden - Leaking Discord Member");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been kicked.\nLeaking Discord Member.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            } else {
                                // Ban
                                member.ban(0, "VVarden - Leaking Discord Member");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been banned.\nLeaking Discord Member.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            }
                            break;
                        case "cheater":
                            if (guildInfo.puncheat == "warn") {
                                // Warn
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":warning: User <@"+member.id+"> joined and has been in "+oldUser.servers.split(";").length+" cheating discords!",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x800000,
                                        }
                                    }
                                );
                            } else if (guildInfo.puncheat == "kick") {
                                // Kick
                                member.kick("VVarden - Cheating Discord Member");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been kicked.\nCheating Discord Member.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            } else {
                                // Ban
                                member.ban(0, "VVarden - Cheating Discord Member");
                                bot.createMessage(
                                    guildInfo.logchan,
                                    {
                                        embed: {
                                            description: ":shield: User <@"+member.id+"> joined and has been banned.\nCheating Discord Member.",
                                            author: {
                                                name: member.username+"#"+member.discriminator,
                                                icon_url: member.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            }
                            break;
                        default:
                            // Probably a bot or whitelisted, so do nothing
                            break;
                    }
                }
            });
        }
    });
});

// MESSAGE PROCESSING
bot.on("messageCreate", (msg) => {

    if (msg.guildID != null) {
        let hay = msg.content.split(" ");
        switch(hay[0]) {
            /* =========================================
                Help Commands
               ========================================= */
            case spc+"help":
                if (hay.length == 1) {
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                //title: "Command Help",
                                description: "Usage: `"+spc+"help <command>`\nYou can type `"+spc+"commands` for a list of commands.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x008000,
                                /*fields: [ // Array of field objects
                                    {
                                        name: "Some extra info.", // Field title
                                        value: "Some extra value.", // Field
                                        inline: true // Whether you want multiple fields in same line
                                    },
                                    {
                                        name: "Some more extra info.",
                                        value: "Another extra value.",
                                        inline: true
                                    }
                                ],
                                footer: { // Footer text
                                    text: "VVarden by Vampire#8144"
                                }*/
                            }
                        }
                    );
                } else {
                    switch (hay[1]) {
                        case "help":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"help [CommandName]`\nGives a short description for each command.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "config":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"config <option> <true/false>`\nDiscord Server Admin configuration.\n**Discord Server Admin Use Only**",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "checkuser":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"checkuser <USERID OR MENTION>`\nChecks for user in the bot database.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "scanusers":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"scanusers `\nScans all your members and automods them.\n**Discord Server Admin Use Only**",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "upstatus":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"upstatus <USERID OR MENTION> <NEW STATUS>`\nChanges the status of a user in the database.\n**Admin Command Only**",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "adduser":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"adduser <USERID OR MENTION> <Status> <UserType> <USER#0000> <KnownServer> <KnownRoles> <ShortReason>`\nAdds a user to the database.\n**Admin Command Only**",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "about":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"about`\nResponds with a little information about the bot and author.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "commands":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"commands`\nGives a list of all the available commands.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "ping":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"ping`\nMakes the bot reply with 'pong', useful for checking connection.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "status":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"status`\nShows current stats about the bot.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        case "procfile":
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "`"+spc+"procfile <file> <serverid> <status>`\nDeveloper Command Only",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                        default:
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "Sorry, there seems to be no help with that command.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                            break;
                    }
                }
                break;
            case spc+"commands":
                bot.createMessage(
                    msg.channel.id,
                    {
                        embed: {
                            title: "Command List",
                            //description: "",
                            author: {
                                name: msg.author.username+"#"+msg.author.discriminator,
                                icon_url: msg.author.avatarURL
                            },
                            color: 0x008000,
                            fields: [ // Array of field objects
                                {
                                    name: spc+"help <command>", // Field
                                    value: "Provides help for commands",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"config <option> <true/false>", // Field
                                    value: "Allows a Discord Server Admin to configure bot options.\n**Admin Only**",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"checkuser <userid or mention>", // Field
                                    value: "Checks for user in the bot database",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"scanusers", // Field
                                    value: "Scans and automods all your members\n**Admin Only**",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"about",
                                    value: "Shows some information about the bots creation",
                                    inline: false
                                },
                                {
                                    name: spc+"commands",
                                    value: "Shows a list of all available commands",
                                    inline: false
                                },
                                {
                                    name: spc+"ping",
                                    value: "Replies with 'Pong!'",
                                    inline: false
                                },
                                {
                                    name: spc+"status",
                                    value: "Shows uptime and other bot stats",
                                    inline: false
                                },
                                {
                                    name: spc+"upstatus <userid or mention> <new status>", // Field
                                    value: "Updates a user status in the database\n**Developer Only**",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"adduser <USERID OR MENTION> <Status> <UserType> <USER#0000> <KnownServer> <KnownRoles> <ShortReason>", // Field
                                    value: "Manually adds a user to the database\n**Developer Only**",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: spc+"procfile <file> <serverid> <userstatus>",
                                    value: "Process a file to the database\n**Developer Only**",
                                    inline: false
                                },
                            ],
                            footer: { // Footer text
                                text: "VVarden by Vampire#8144"
                            }
                        }
                    }
                );
                break;
            case spc+"about":
                bot.createMessage(
                    msg.channel.id,
                    {
                        embed: {
                            title: "About Me",
                            description: "Hello, my name is VVarden!\nYou can call me Warden or 5 Warden (V Warden).\n\nI was created by Vampire#8144 in an effort to combat the prevalence of pirated code and cheating in the FiveM community, commonly called 'leaks' and 'hacks/cheats'.\n\nI am the frontend for a database of users in Leaking and Cheating Discord servers, with settings to prevent those users from entering your discord server.\n\nI am coded using the 'Eris' package for 'NodeJS'.\n<https://github.com/abalabahaha/eris>\n\nYou can join the Official Discord for more information: <https://discord.gg/jeFeDRasfs>",
                            /*author: {
                                name: msg.author.username+"#"+msg.author.discriminator,
                                icon_url: msg.author.avatarURL
                            },*/
                            color: 0x008000,
                            footer: { // Footer text
                                text: "VVarden by Vampire#8144"
                            }
                        }
                    }
                );
                break;
            case spc+"ping":
                bot.createMessage(
                    msg.channel.id,
                    {
                        embed: {
                            description: msg.author.mention+" Pong!",
                            color: 0x008000,
                        }
                    }
                );
                break;
            case spc+"test":
                if (msg.author.id == dev) {
                    logMaster(badservers["756265782110846976"]);
                }
                break;
            case spc+"status":
                bot.createMessage(
                    msg.channel.id,
                    {
                        embed: {
                            title: ":desktop: Bot Status",
                            //description: "",
                            /*author: {
                                name: msg.author.username+"#"+msg.author.discriminator,
                                icon_url: msg.author.avatarURL
                            },*/
                            color: 0x008000,
                            fields: [ // Array of field objects
                                {
                                    name: "Protected Guilds", // Field
                                    value: "I am watching "+bot.guilds.size+" Guilds",
                                    inline: false // Whether you want multiple fields in same line
                                },
                                {
                                    name: "Bot Uptime Since Last Restart",
                                    value: "I have been up for "+(Math.round((process.uptime()/60) * 100) / 100)+" minutes",
                                    inline: false
                                },
                                {
                                    name: "Memory Usage",
                                    value: "I am currently using "+(Math.round((process.memoryUsage().heapUsed/1024/1024) * 100) / 100)+" MB of RAM.",
                                    inline: false
                                }
                            ],
                            footer: { // Footer text
                                text: "VVarden by Vampire#8144"
                            }
                        }
                    }
                );
                break;
            case spc+"scanusers":
                var isAdmin = msg.member.permissions.has("administrator");
                if (isAdmin) {
                    logMaster("Guild ID: "+msg.guildID+" / "+msg.author.username+"#"+msg.author.discriminator+" running `scanusers` command");
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: "Now scanning users. This may take awhile so be patient.\nBe aware this is intended to only run once per discord server.\nAbuse of this command will result in punishment.",
                                color: 0x808000,
                            }
                        }
                    );
                    bot.guilds.get(msg.guildID).fetchAllMembers().then( () => {
                        getGuildSettings(msg.guildID, function (guildInfo) {
                            bot.guilds.get(msg.guildID).members.forEach((value, key) => {
                                if (guildInfo == "nores") {
                                    logMaster("Bot is in unknown guild???\n"+msg.guildID+" Save me Vampire!!!");
                                } else {
                                    let member = bot.guilds.get(msg.guildID).members.get(key);
                                    //logMaster("Checking "+member.id);
                                    // Now Get Member Info
                                    getUserFromDB(member.id, function (oldUser) {
                                        if (oldUser == "nores") {
                                            // User Does not exist, so do nothing I guess?
                                            // Maybe in the future give a clean log
                                        } else {
                                            // User Exists, Process
                                            /*
                                                punown = owner
                                                punsupp = supporter
                                                punleak = leaker
                                                puncheat = cheater
                                            */
                                            switch(oldUser.user_type) {
                                                case "owner":
                                                    if (guildInfo.punown == "kick") {
                                                        // Kick
                                                        member.kick("VVarden - Leaking or Cheating Discord Staff");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been kicked.\nLeaking or Cheating Discord Owner.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        // Ban
                                                        member.ban(0, "VVarden - Leaking or Cheating Discord Staff");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been banned.\nLeaking or Cheating Discord Owner.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    }
                                                    break;
                                                case "supporter":
                                                    if (guildInfo.punsupp == "kick") {
                                                        // Kick
                                                        member.kick("VVarden - Leaking or Cheating Discord Supporter");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been kicked.\nLeaking or Cheating Discord Supporter.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        // Ban
                                                        member.ban(0, "VVarden - Leaking or Cheating Discord Supporter");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been banned.\nLeaking or Cheating Discord Supporter.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    }
                                                    break;
                                                case "leaker":
                                                    if (guildInfo.punleak == "warn") {
                                                        // Warn
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":warning: User <@"+member.id+"> has been in "+oldUser.servers.split(";").length+" leaking discords!",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x800000,
                                                                }
                                                            }
                                                        );
                                                    } else if (guildInfo.punleak == "kick") {
                                                        // Kick
                                                        member.kick("VVarden - Leaking Discord Member");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been kicked.\nLeaking Discord Member.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        // Ban
                                                        member.ban(0, "VVarden - Leaking Discord Member");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been banned.\nLeaking Discord Member.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    }
                                                    break;
                                                case "cheater":
                                                    if (guildInfo.puncheat == "warn") {
                                                        // Warn
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":warning: User <@"+member.id+"> has been in "+oldUser.servers.split(";").length+" cheating discords!",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x800000,
                                                                }
                                                            }
                                                        );
                                                    } else if (guildInfo.puncheat == "kick") {
                                                        // Kick
                                                        member.kick("VVarden - Cheating Discord Member");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been kicked.\nCheating Discord Member.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    } else {
                                                        // Ban
                                                        member.ban(0, "VVarden - Cheating Discord Member");
                                                        bot.createMessage(
                                                            guildInfo.logchan,
                                                            {
                                                                embed: {
                                                                    description: ":shield: User <@"+member.id+"> has been banned.\nCheating Discord Member.",
                                                                    author: {
                                                                        name: member.username+"#"+member.discriminator,
                                                                        icon_url: member.avatarURL
                                                                    },
                                                                    color: 0x008000,
                                                                }
                                                            }
                                                        );
                                                    }
                                                    break;
                                                default:
                                                    // Probably a bot or whitelisted, so do nothing
                                                    break;
                                            }
                                        }
                                    });
                                }
                            });
                        });
                    });
                } else {
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Discord Admin Command Only\nContinued abuse will result in punishment.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
                break;
            case spc+"checkuser":
                if (hay[1].charAt(1) != "#" && hay[1].charAt(2) != "&") { // Prevent Channel and Role Mentions
                    let userID = hay[1];
                    if (userID.charAt(0) == "<" && userID.charAt(userID.length-1) == ">") {
                        // Mention
                        userID = stripID(userID);
                    }
                    getUserFromDB(userID, function (userInfo) {
                        if (userInfo == "nores") {
                            // Not In Database
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: ":white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.",
                                        /*author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },*/
                                        color: 0x808000,
                                    }
                                }
                            );
                        } else {
                            if (userInfo.status != "whitelisted" && userInfo.status != "bot") {
                                // In Database, Show Info
                                bot.createMessage(
                                    msg.channel.id,
                                    {
                                        embed: {
                                            title: ":x: User Blacklisted",
                                            description: "<@"+userInfo.userid+"> has been in "+userInfo.servers.split(";").length+" bad Discord servers.",
                                            author: {
                                                name: userInfo.last_username,
                                                icon_url: userInfo.avatar
                                            },
                                            thumbnail: { url: userInfo.avatar },
                                            color: 0x800000,
                                            fields: [ // Array of field objects
                                                {
                                                    name: "User Information", // Field
                                                    value: "**ID**: "+userInfo.userid+" / **Name**: "+userInfo.last_username+"",
                                                    inline: false // Whether you want multiple fields in same line
                                                },
                                                {
                                                    name: "Known Discord Roles",
                                                    value: userInfo.roles.split(";").join(",\n"),
                                                    inline: false
                                                },
                                                {
                                                    name: "Blacklist Reason",
                                                    value: "**User Type**: "+userInfo.user_type+"\n**Details**: "+userInfo.reason,
                                                    inline: false
                                                },
                                                {
                                                    name: "Added Type: "+userInfo.filter_type,
                                                    value: "**Date Added**: "+userInfo.added_date,
                                                    inline: false
                                                },
                                            ],
                                            footer: { // Footer text
                                                text: "VVarden by Vampire#8144"
                                            }
                                        }
                                    }
                                );
                            } else {
                                // User is Whitelisted, fake it
                                bot.createMessage(
                                    msg.channel.id,
                                    {
                                        embed: {
                                            description: ":white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.",
                                            /*author: {
                                                name: msg.author.username+"#"+msg.author.discriminator,
                                                icon_url: msg.author.avatarURL
                                            },*/
                                            color: 0x808000,
                                        }
                                    }
                                );
                            }
                        }
                    });
                } else {
                    // Show Help
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Error with command.\nPlease use a valid User ID or Mention.\n`"+spc+"checkuser <userid>`",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
                break;
            case spc+"procfile":
                if (msg.author.id == dev) {
                    if (hay.length >= 3) {
                        processCSVImport(hay[1], hay[2], hay[3], function (ret) {
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: "Running command.\nCheck added users for results.",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x008000,
                                    }
                                }
                            );
                        });
                    } else {
                        bot.createMessage(
                            msg.channel.id,
                            {
                                embed: {
                                    description: ":x: Invalid Argument Count",
                                    author: {
                                        name: msg.author.username+"#"+msg.author.discriminator,
                                        icon_url: msg.author.avatarURL
                                    },
                                    color: 0x800000,
                                }
                            }
                        );
                    }
                } else {
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Developer Command Only\nContinued abuse will result in punishment.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
                break;
            case spc+"upstatus":
                if (admin.includes(msg.author.id)) {
                    if (hay.length >= 3) {
                        if (hay[1].charAt(1) != "#" && hay[1].charAt(2) != "&") { // Prevent Channel and Role Mentions
                            let userID = hay[1];
                            if (userID.charAt(0) == "<" && userID.charAt(userID.length-1) == ">") {
                                // Mention
                                userID = stripID(userID);
                            }
                            let reason = hay;
                            reason.splice(0, 2);
                            updateUserStatus(userID, hay[2], reason, function (ret) {
                                bot.createMessage(
                                    msg.channel.id,
                                    {
                                        embed: {
                                            description: ret,
                                            author: {
                                                name: msg.author.username+"#"+msg.author.discriminator,
                                                icon_url: msg.author.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            });
                        } else {
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: ":x: Invalid Mention or UserID\nCheck your User ID or Mention is correct",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x800000,
                                    }
                                }
                            );
                        }
                    } else {
                        bot.createMessage(
                            msg.channel.id,
                            {
                                embed: {
                                    description: ":x: Invalid Argument Count\nMust have two arguments",
                                    author: {
                                        name: msg.author.username+"#"+msg.author.discriminator,
                                        icon_url: msg.author.avatarURL
                                    },
                                    color: 0x800000,
                                }
                            }
                        );
                    }
                } else {
                    logMaster(":x: User tried Admin Command\n"+msg.author.id+" <@"+msg.author.id+"> tried to use an admin command in "+msg.guildID+"")
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Admin Command Only\nIf you are seeking to be whitelisted, join the official discord.\nContinued abuse will result in punishment.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
            case spc+"adduser":
                if (admin.includes(msg.author.id)) {
                    if (hay.length >= 8) {
                        if (hay[1].charAt(1) != "#" && hay[1].charAt(2) != "&") { // Prevent Channel and Role Mentions
                            let userID = hay[1];
                            let status = hay[2];
                            let usertype = hay[3];
                            let lastuser = hay[4];
                            let server = hay[5];
                            let roles = hay[6];
                            let filtertype = hay[7];
                            if (userID.charAt(0) == "<" && userID.charAt(userID.length-1) == ">") {
                                // Mention
                                userID = stripID(userID);
                            }
                            addUserToDBMan(userID, status, usertype, lastuser, server, roles, filtertype, function (ret) {
                                bot.createMessage(
                                    msg.channel.id,
                                    {
                                        embed: {
                                            description: ret,
                                            author: {
                                                name: msg.author.username+"#"+msg.author.discriminator,
                                                icon_url: msg.author.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            });
                        } else {
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: ":x: Invalid Mention or UserID\nCheck your User ID or Mention is correct\nInvalid parameters in this command **will** require developer repair\nUse `"+spc+"help` if you are unsure",
                                        author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },
                                        color: 0x800000,
                                    }
                                }
                            );
                        }
                    } else {
                        bot.createMessage(
                            msg.channel.id,
                            {
                                embed: {
                                    description: ":x: Invalid Argument Count\n**Please** verify your arguments are correct.\nBad arguments in this command **will** require developer repair\nUse `"+spc+"help` if you are unsure",
                                    author: {
                                        name: msg.author.username+"#"+msg.author.discriminator,
                                        icon_url: msg.author.avatarURL
                                    },
                                    color: 0x800000,
                                }
                            }
                        );
                    }
                } else {
                    logMaster(":x: User tried Admin Command\n"+msg.author.id+" <@"+msg.author.id+"> tried to use an admin command in "+msg.guildID+"")
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Admin Command Only\nIf you are seeking to be whitelisted, join the official discord.\nContinued abuse will result in punishment.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
                break;
            case spc+"config":
                var isAdmin = msg.member.permissions.has("administrator");
                if (isAdmin) {
                    getGuildSettings(msg.guildID, function (guildInfo) {
                        if (hay.length <= 2) {
                            // !config or !config <option> - Show Settings and Info
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        title: "Server Configuration",
                                        description: "To change a setting use the config command with one of the options\nFor example: `"+spc+"config punleak ban`",
                                        /*author: {
                                            name: msg.author.username+"#"+msg.author.discriminator,
                                            icon_url: msg.author.avatarURL
                                        },*/
                                        color: 0x008000,
                                        fields: [ // Array of field objects
                                            {
                                                name: "logchan - Log Channel", // Field
                                                value: "I am using <#"+guildInfo.logchan+"> for my logs\nThis is where I will post messages about the actions I take.",
                                                inline: false // Whether you want multiple fields in same line
                                            },
                                            {
                                                name: "punown - Punish Owners [kick/ban]",
                                                value: "I am set to **"+guildInfo.punown+"** Leak and Cheat Server Owners\nThese are the Owners and Staff Members of these Discords",
                                                inline: false
                                            },
                                            {
                                                name: "punsupp - Punish Supporters [kick/ban]",
                                                value: "I am set to **"+guildInfo.punsupp+"** Leak and Cheat Server Supporters\nThese are Nitro Boosters, Customers, or other types of Donators.",
                                                inline: false
                                            },
                                            {
                                                name: "punleak - Punish Leakers [warn/kick/ban]",
                                                value: "I am set to **"+guildInfo.punleak+"** Members of Leaking Discords.\nThese are users with only a Member Role in these servers.",
                                                inline: false
                                            },
                                            {
                                                name: "puncheat - Punish Cheaters [warn/kick/ban]",
                                                value: "I am set to **"+guildInfo.puncheat+"** Members of Cheating Discords.\nThese are users with only a Member Role in these servers.",
                                                inline: false
                                            }
                                        ],
                                        footer: { // Footer text
                                            text: "VVarden by Vampire#8144"
                                        }
                                    }
                                }
                            );
                        } else if (hay.length > 2) {
                            // !config [option] [setting] - change setting
                            let guildVal = hay[2];
                            if (guildVal.charAt(0) == "<" && guildVal.charAt(guildVal.length-1) == ">" && guildVal.charAt(1) == "#") {
                                guildVal = stripChan(hay[2]);
                            }
                            changeGuildSetting(msg.guildID, hay[1], guildVal, function (ret) {
                                bot.createMessage(
                                    msg.channel.id,
                                    {
                                        embed: {
                                            description: ret,
                                            author: {
                                                name: msg.author.username+"#"+msg.author.discriminator,
                                                icon_url: msg.author.avatarURL
                                            },
                                            color: 0x008000,
                                        }
                                    }
                                );
                            });
                        }
                    });
                } else {
                    bot.createMessage(
                        msg.channel.id,
                        {
                            embed: {
                                description: ":x: Discord Admin Command Only\nContinued abuse will result in punishment.",
                                author: {
                                    name: msg.author.username+"#"+msg.author.discriminator,
                                    icon_url: msg.author.avatarURL
                                },
                                color: 0x800000,
                            }
                        }
                    );
                }
                break;
            // Default Command Return is Ignore
            default:
                break;
        }
    };
});

// CONNECT AND INTERVALS
bot.connect();

setInterval(randomStatus, 5000)
