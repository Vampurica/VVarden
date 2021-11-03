// Triggers when an interaction is used, such as a slash command
const util = require('../utils.js');

const interactionCreate = function (interaction) {
  require(`../interactions/${interaction.data.name}.js`)(interaction);
};

module.exports = interactionCreate;
