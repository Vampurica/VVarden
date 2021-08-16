// Help Commands
// Help command code stolen from Eris internal, and modified

let help = function() {
    bot.registerCommand("help", (msg, args) => {
        if(args.length > 0) {
            // help + args
            var result = "";

            let cur = bot.commands[bot.commandAliases[args[0]] || args[0]];
            if(!cur) {
                return "Help for that command not found.";
            }
            let {label} = cur;
            for(let i = 1; i < args.length; ++i) {
                cur = cur.subcommands[cur.subcommandAliases[args[i]] || args[i]];
                if(!cur) {
                    return "Help for that command not found.";
                }
                label += ` ${cur.label}`;
            }
            result += "`"+msg.prefix+label+"`\n- "+cur.fullDescription+"\n\nExample: "+msg.prefix+cur.usage
            if(cur.aliases.length > 0) {
                result += `\n\nAliases: ${cur.aliases.join(", ")}`;
            }
            const subcommands = Object.keys(cur.subcommands);
            if(subcommands.length > 0) {
                result += "\n\nSubcommands:";
                for(const subLabel of subcommands) {
                    if(cur.subcommands.hasOwnProperty(subLabel) && cur.subcommands[subLabel].permissionCheck(msg)) {
                        result += "\n  "+subLabel+" - "+cur.subcommands[subLabel].description;
                    }
                }
            }

            bot.createMessage(
                msg.channel.id,
                {
                    embed: {
                        description: result,
                        author: {
                            name: msg.author.username+"#"+msg.author.discriminator,
                            icon_url: msg.author.avatarURL
                        },
                        color: 0x008000,
                    }
                }
            );
        } else {
            // no args
            var commands = [];

            for(const label in bot.commands) {
                if(bot.commands.hasOwnProperty(label) && bot.commands[label] && bot.commands[label].permissionCheck(msg) && !bot.commands[label].hidden) {
                    let res = {name: msg.prefix + label, value: "- "+bot.commands[label].description, inline: false};
                    commands.push(res);
                }
            }

            bot.createMessage(
                msg.channel.id,
                {
                    embed: {
                        title: "Command List",
                        author: {
                            name: msg.author.username+"#"+msg.author.discriminator,
                            icon_url: msg.author.avatarURL
                        },
                        color: 0x008000,
                        fields: commands,
                        footer: { // Footer text
                            text: "VVarden by Vampire#8144"
                        }
                    }
                }
            );
        }

    }, {
        description: "This help text",
        fullDescription: "Help for commands including this help text.",
        usage: "help about"
    });

};

module.exports = help;
