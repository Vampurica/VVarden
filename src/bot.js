import { CommandClient } from 'eris';
import config from './config';

if (!process.env.BOT_TOKEN) throw new Error(`Missing environment variables`);

const bot = new CommandClient(
  process.env.BOT_TOKEN,
  {
    getAllUsers: true,
    intents: ['guildMembers', 'guildMessages', 'guilds'],
    restMode: true,
    maxShards: process.env.DEVELOPMENT ? parseInt(process.env.DEVELOPMENT) : 4,
  },
  {
    description: 'A discord bot that cross-references people in bad discords',
    owner: 'Vampire#8144',
    prefix: config.spc,
    defaultHelpCommand: false,
  }
);

export default bot;
