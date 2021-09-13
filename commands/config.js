let logchan;
let logExist;
let prefix;
let punown;
let punsupp;
let punleak;
let puncheat;


let dconfig = function() {
    let main = bot.registerCommand("config", (msg, args) => {
        func.getGuildSettings(msg.guildID, function (guildInfo) {
            if(!guildInfo.logchan) {
                logExist = false;
                bot.createMessage( msg.channel.id, ':warning: No log channel found. this action will not log.');
            } else if (guildInfo.logchan) {
                logExist = true;
                logchan = guildInfo.logchan;
            }
            // Set the OLD config settings for logging.
            prefix = guildInfo.prefix;
            punown = guildInfo.punown;
            punsupp = guildInfo.punsupp;
            punleak = guildInfo.punleak;
            puncheat = guildInfo.puncheat;
            bot.createMessage(
                msg.channel.id,
                {
                    embed: {
                        title: "Server Configuration",
                        description: "To change a setting use the config command with one of the options\nFor example: `"+spc+"config punleak ban`",
                        color: 0x008000,
                        fields: [
                            {
                                name: "prefix - Command Prefix",
                                value: "I am using `"+guildInfo.prefix+"` for this guild.",
                                inline: false
                            },
                            {
                                name: "logchan - Log Channel",
                                value: "I am using <#"+guildInfo.logchan+"> for my logs\nThis is where I will post messages about the actions I take.",
                                inline: false
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
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Guild Settings",
        fullDescription: "Adjust this Guilds Settings for Warden",
        usage: "config punleak ban",
        aliases: ["settings","configuration"],
        argsRequired: false,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("prefix", (msg, args) => {
        func.changeGuildSetting(msg.guildID, "prefix", args[0], function (ret) {
            bot.registerGuildPrefix(msg.guildID, args[0]);
            bot.createMessage(
                msg.channel.id,
                {
                    embed: {
                        description: ret,
                        color: 0x008000,
                        author: {
                            name: msg.author.username+"#"+msg.author.discriminator,
                            icon_url: msg.author.avatarURL
                        },
                    }
                }
            );
            if(logExist) {
                bot.createMessage(
                    logchan,
                    {
                        embed: {
                            color: 0x008000,
                            title: 'Config was changed sucessfuly!',
                            description: 'The config var: `prefix` was changed by: ' + msg.author.username + `\n Old value: ${prefix} \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                        },
                    }
                ); 
            }
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Change Guild Prefix",
        fullDescription: "Change the command prefix for Warden in this guild.",
        usage: "config prefix $$",
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("logchan", (msg, args) => {
        if (msg.channelMentions.length > 0 && typeof msg.channelMentions[0] !== "undefined") {
            // Channel Mention
            func.changeGuildSetting(msg.guildID, "logchan", msg.channelMentions[0], function (ret) {
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
                if(logExist) {
                    bot.createMessage(
                        logchan,
                        {
                            embed: {
                                color: 0x008000,
                                title: 'Config was changed sucessfuly!',
                                description: 'The config var: `logchan` was changed by: ' + msg.author.username + `\n Old value: <#${logchan}> \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                            },
                        }
                    ); 
                }
            });
        } else {
            // No mention
            bot.createMessage(
                msg.channel.id,
                ":x: Invalid Channel Mention."
            );
        }
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Change Log Channel",
        fullDescription: "Change log channel, must be a mention.",
        usage: "config logchan #channel",
        aliases: ["log"],
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("punown", (msg, args) => {
        func.changeGuildSetting(msg.guildID, "punown", args[0], function (ret) {
            bot.createMessage(
                msg.channel.id,
                {
                    embed: {
                        color: 0x008000,
                        description: ret,
                        author: {
                            name: msg.author.username+"#"+msg.author.discriminator,
                            icon_url: msg.author.avatarURL
                        },
                    }
                }
            );
            if(logExist) {
                bot.createMessage(
                    logchan,
                    {
                        embed: {
                            color: 0x008000,
                            title: 'Config was changed sucessfuly!',
                            description: 'The config var: `punown` was changed by: ' + msg.author.username + `\n Old value: ${punown} \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                        },
                    }
                ); 
            }
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Punish Owner Setting",
        fullDescription: "Adjust how to treat Owners/Staff of bad discords",
        usage: "config punown ban",
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("punsupp", (msg, args) => {
        func.changeGuildSetting(msg.guildID, "punsupp", args[0], function (ret) {
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
            if(logExist) {
                bot.createMessage(
                    logchan,
                    {
                        embed: {
                            color: 0x008000,
                            title: 'Config was changed sucessfuly!',
                            description: 'The config var: `punsupp` was changed by: ' + msg.author.username + `\n Old value: ${punsupp} \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                        },
                    }
                ); 
            }
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Punish Supporter Setting",
        fullDescription: "Adjust how to treat Supporters/Donors of bad discords",
        usage: "config punsupp ban",
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("punleak", (msg, args) => {
        func.changeGuildSetting(msg.guildID, "punleak", args[0], function (ret) {
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
            if(logExist) {
                bot.createMessage(
                    logchan,
                    {
                        embed: {
                            color: 0x008000,
                            title: 'Config was changed sucessfuly!',
                            description: 'The config var: `punleak` was changed by: ' + msg.author.username + `\n Old value: ${punleak} \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                        },
                    }
                ); 
            }
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Punish Leaker Setting",
        fullDescription: "Adjust how to treat Members of leaking discords",
        usage: "config punleak ban",
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });

    main.registerSubcommand("puncheat", (msg, args) => {
        func.changeGuildSetting(msg.guildID, "puncheat", args[0], function (ret) {
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
            if(logExist) {
                bot.createMessage(
                    logchan,
                    {
                        embed: {
                            color: 0x008000,
                            title: 'Config was changed sucessfuly!',
                            description: 'The config var: `puncheat` was changed by: ' + msg.author.username + `\n Old value: ${puncheat} \n New value: ${args[0]}` + `\n At ${new Date().toLocaleString()} EST.`
                        },
                    }
                ); 
            }
        });
    },{
        requirements: {
            permissions: {
                "administrator": true
            }
        },
        description: "Punish Cheater Setting",
        fullDescription: "Adjust how to treat members of cheating discords",
        usage: "config puncheat ban",
        argsRequired: true,
        permissionMessage: "You must be a SERVER ADMIN to use this command."
    });
};

module.exports = dconfig;