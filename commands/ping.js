// Ping and variations

let ping = function () {
  bot.registerCommand('ping', 'Pong!', {
    // Responds with "Pong!" when someone says "!ping"
    description: 'Pong!',
    fullDescription: 'Used to check that the bot is online.',
    usage: 'ping',
  });

  bot.registerCommand('pong', 'Ping!', {
    // Responds with "Pong!" when someone says "!ping"
    description: 'Ping!',
    fullDescription: 'Used to check that the bot is online.',
    hidden: true,
    usage: 'pong',
  });

  bot.registerCommand('marco', 'Polo!', {
    // Responds with "Pong!" when someone says "!ping"
    description: 'Polo!',
    fullDescription: 'Used to check that the bot is online.',
    usage: 'marco',
  });

  bot.registerCommand('polo', "That's not how Marco - Polo works!", {
    // Responds with "Pong!" when someone says "!ping"
    description: 'Easter Egg',
    fullDescription: 'An Easter Egg to pair with Marco command.',
    hidden: true,
    usage: 'polo',
  });
};

module.exports = ping;
