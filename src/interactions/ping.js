import { CommandInteraction, Constants } from 'eris';
import bot from '../bot';

bot.createGuildCommand('927660169968623657', {
  name: 'ping',
  description: 'Replies with Pong!',
  type: Constants.ApplicationCommandTypes.CHAT_INPUT,
});

/**
 * @param {CommandInteraction} interaction
 */
export default async (interaction) => {
  await interaction.acknowledge();

  const message = await interaction.createFollowup({
    embeds: [
      {
        description: `:chart_with_upwards_trend: Pong!`,
        color: 0x008000,
      },
    ],
  });

  const pong = message.timestamp - interaction.createdAt;
  // @ts-ignore
  const ws = bot.shards.find((shard) => shard.id === bot.guildShardMap[interaction.guildID])?.latency;

  interaction.editMessage(message.id, {
    embeds: [
      {
        description: `:chart_with_upwards_trend: Pong!\n${pong}ms RTT Latency\n${0}ms Shard Heartbeat`,
        color: 0x008000,
      },
    ],
  });
};
