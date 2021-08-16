// Invite Bot

let invite = function() {
    bot.registerCommand("invite", (msg, args) => {
        bot.createMessage(
            msg.channel.id,
            {
                embed: {
                    title: "Invite Me",
                    description: "If you would like to invite me to your own discord, please visit this link:\n<https://discord.com/api/oauth2/authorize?client_id=874059310869655662&permissions=8&scope=bot>\n\nI will need kick and ban permissions as well as a role higher than the users I am acting on.",
                    color: 0x008000,
                    footer: { // Footer text
                        text: "VVarden by Vampire#8144"
                    }
                }
            }
        );
    },{
        description: "Invite This Bot",
        fullDescription: "Shares the link to invite this bot to your own discord.",
        usage: "invite"
    });
};

module.exports = invite;
