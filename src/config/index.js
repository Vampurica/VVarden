import dotenv from 'dotenv';

// Inject environment variables
dotenv.config();

if (!process.env.CHANNEL_LOG || !process.env.CHANNEL_ADDUSERS) throw new Error(`Missing environment variables`);

export default {
  dev: [process.env.DEV],
  admin: [
    '282199104996507650', // Vampire
    '160347445711077376', // Linden
    '440311310530510868', // Technetium
    '104783629586083840', // Rio
    '640703664738271233', // Dunak
    '298207278375370763', // Eruzil
    '793379017062350888', // Kakarot
    '215806999005364226', // DokaDoka
    '588473874644074517', // Kawan
    '114090291203407875', // Synthethics
    '142145605592940544', // BerkieB
    '273852112767680523', // ChatDisabled
    '189388404461535232', // Holiday
    '464660411237793804', // BigBear
    '793608661863628820', // ActuallyStrez
    '755635619035611158', // Bombay
    '128262487979196416', // Olliee_RPG
    '102743329871007744', // Idris
    '542799191282417684', // Volumed
  ],
  logChannel: process.env.CHANNEL_LOG,
  addUsersChannel: process.env.CHANNEL_ADDUSERS,
  spc: 'war ',
};
