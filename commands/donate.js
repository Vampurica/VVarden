// donate

let donate = function() {
    bot.registerCommand("upstatus", (msg, args) => {
        bot.createMessage(
            msg.channel.id,
            {
                embed: {
                    title: "Donate",
                    description: "If you would like to donate to me, or the CFX Community Improvement Project that created Warden, you can do so via Ko-Fi.\nDonations don't get you anything except for a thank you message in the donations channel of the discord.\nDonations made will be used to upkeep the bots and offset living costs of the creators and maintainers.\n\n**Ko-Fi**: <https://ko-fi.com/vampuric>",
                    color: 0x008000,
                    footer: { // Footer text
                        text: "VVarden by Vampire#8144"
                    }
                }
            }
        );
    }, {
        description: "Donation Information",
        fullDescription: "Shares information on how to donate",
        usage: "donate",
        aliases: ["dono"]
    });
};

module.exports = donate;
