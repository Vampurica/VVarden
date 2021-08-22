// Procfile

let procfile = function() {
    bot.registerCommand("procfile", (msg, args) => {
        // TODO: add validation, dev only so meh atm
        if (args.length == 3) {
            func.processCSVImport(args[0], args[1], args[2], function (ret) {
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
                "Invalid Argument Length."
            );
        }
    },{
        requirements: {
            userIDs: [dev]
        },
        description: "Import File",
        fullDescription: "Process and Import User Files",
        usage: "procfile LeakerLeaks 0000000000000 leaker",
        aliases: ["pf"],
        hidden: true,
        argsRequired: true,
        permissionMessage: "You must be a BOT OWNER to use this command."
    });
};

module.exports = procfile;
