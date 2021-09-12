const {func}    = require("../functions.js");
const util      = require("../utils.js");

// forcecheck
let forcecheck = function() {
    bot.registerCommand("forcecheck", (msg, args) => {
        if (args.length == 1) {
            // Has UserID
            if (msg.mentions.length > 0) {
                // It is a mention, so use it
                let userID = msg.mentions[0].id;

                func.globalFindAndCheck(userID);

                bot.createMessage(
                    msg.channel.id,
                    "Force Checking User"
                );
            } else {
                // Not a Mention, try ID
                let userID = args[0].charAt[0] == "<" ? util.stripID(args[0]) : args[0];

                if (!isNaN(userID)) {
                    // Is Number, use it
                    func.globalFindAndCheck(userID);
                    bot.createMessage(
                        msg.channel.id,
                        "Force Checking User"
                    );
                } else {
                    // NaN, must be bad
                    bot.createMessage(
                        msg.channel.id,
                        "Invalid User ID or Mention."
                    );
                }
            }
        }
    }, {
        description: "Force Check on a User",
        fullDescription: "Checks the DB status of a user and global automods if needed",
        usage: "forcecheck 000000000000000",
        aliases: ["fc"],
        argsRequired: true
    });
};

module.exports = forcecheck;
