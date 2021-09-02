// Adduser

let adduser = function() {
    bot.registerCommand("adduser", (msg, args) => {
        if (args.length == 1) {
            // Only ID, default to blacklisted leaker
            if (!isNaN(args[0])) {
                // It's a number, so run it
                let userID = args[0];
                func.addUserToDBMan(userID, "blacklisted", "leaker", "860760302227161118", "Manual: Member of Blacklisted Discord Server", function (ret) {
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
                // NaN, verify ID
                let userID = util.stripID(args[0]);
                if (!isNaN(userID)) {
                    // Valid now
                    func.addUserToDBMan(userID, "blacklisted", "leaker", "860760302227161118", "Manual: Member of Blacklisted Discord Server", function (ret) {
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
                    // Invalid
                    bot.createMessage(
                        msg.channel.id,
                        "Invalid UserID or Mention."
                    );
                }
            }
        } else if (args.length >= 3) {
            // ID, status, and type, or more
            if (!isNaN(args[0])) {
                // Valid ID
                let userID = args[0];
                let status = typeof(args[1]) !== "undefined" ? args[1] : "blacklisted";
                let type = typeof(args[2]) !== "undefined" ? args[2] : "leaker";
                let server = typeof(args[3]) !== "undefined" ? args[3] : "860760302227161118";
                let reason = args.length > 4 ? args.splice(4, args.length-1).join(" ") : "Manual: Member of Blacklisted Discord Server";

                func.addUserToDBMan(userID, status, type, server, reason, function (ret) {
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
                // Mention?
                let userID = util.stripID(args[0]);
                if (!isNaN(userID)) {
                    // ID Now
                    let status = typeof(args[1]) !== "undefined" ? args[1] : "blacklisted";
                    let type = typeof(args[2]) !== "undefined" ? args[2] : "leaker";
                    let server = typeof(args[3]) !== "undefined" ? args[3] : "860760302227161118";
                    let reason = args.length > 4 ? args.splice(4, args.length-1).join(" ") : "Manual: Member of Blacklisted Discord Server";

                    func.addUserToDBMan(userID, status, type, server, reason, function (ret) {
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
                    // Still NaN, bad
                    bot.createMessage(
                        msg.channel.id,
                        "Invalid UserID or Mention."
                    );
                }
            }
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
        description: "Add a User to the database",
        fullDescription: "Add a user to the database",
        usage: "adduser 0000000000000 blacklisted leaker 000000000000 Sucks at life",
        aliases: ["add"],
        argsRequired: true,
        permissionMessage: "You must be a BOT OWNER to use this command"
    });
};

module.exports = adduser;
