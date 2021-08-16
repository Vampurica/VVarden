// Checkuser

let checkuser = function() {
    bot.registerCommand("checkuseradmin", (msg, args) => {
        // TODO: add validation, dev only so meh atm
        if (args.length == 1) {

            if (msg.mentions.length > 0) {
                // Mentioned user
                let userID = msg.mentions[0].id;
                func.getUserFromDB(userID, function (userInfo) {
                    if (userInfo == "nores") {
                        // Not In Database
                        bot.createMessage(
                            msg.channel.id,
                            {
                                embed: {
                                    description: ":white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.",
                                    color: 0xFFFF00,
                                }
                            }
                        );
                    } else {
                        // In Database
                        let roles = userInfo.roles.split(";").join(",\n");
                        if (roles == "") {
                            roles = "None";
                        }
                        let sids = userInfo.servers.split(";");
                        let servers = [];
                        sids.forEach(element => {
                            if (badservers[element] != null) {
                                servers.push(badservers[element]);
                            } else {
                                servers.push(element);
                            }
                        });

                        bot.createMessage(
                            msg.channel.id,
                            {
                                embed: {
                                    title: ":x: User In Database",
                                    description: "<@"+userInfo.userid+"> has been in "+userInfo.servers.split(";").length+" Discord servers.",
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
                                            value: roles.substring(0, 1024),
                                            inline: false
                                        },
                                        {
                                            name: "Known Servers",
                                            value: servers.join(",\n").substring(0, 1024),
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
                    }
                });
            } else {
                let userID = args[0].charAt[0] == "<" ? util.stripID(args[0]) : args[0];

                if (!isNaN(userID)) {
                    // Should be a valid ID
                    func.getUserFromDB(userID, function (userInfo) {
                        if (userInfo == "nores") {
                            // Not In Database
                            bot.createMessage(
                                msg.channel.id,
                                {
                                    embed: {
                                        description: ":white_check_mark: UserID not found in Database.\nThey are either fine or not yet listed.",
                                        color: 0xFFFF00,
                                    }
                                }
                            );
                        } else {
                            // In Database
                            let roles = userInfo.roles.split(";").join(",\n");
                            if (roles == "") {
                                roles = "None";
                            }
                            let sids = userInfo.servers.split(";");
                            let servers = [];
                            sids.forEach(element => {
                                if (badservers[element] != null) {
                                    servers.push(badservers[element]);
                                } else {
                                    servers.push(element);
                                }
                            });

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
                                                value: roles.substring(0, 1024),
                                                inline: false
                                            },
                                            {
                                                name: "Known Servers",
                                                value: servers.join(",\n").substring(0, 1024),
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
                        }
                    });
                } else {
                    // Not a Number
                    bot.createMessage(
                        msg.channel.id,
                        "Invalid User ID or Mention."
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
            userIDs: admin
        },
        description: "Check User Admin",
        fullDescription: "Check user database status as an admin",
        usage: "cua 000000000000000",
        aliases: ["cua"],
        argsRequired: true
    });
};

module.exports = checkuser;
