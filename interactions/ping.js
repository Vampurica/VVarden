// Ping and variations

let ping = async (interaction, load) => {
  load = load == undefined ? false : load;

  if (load) {
    bot.createCommand({
      name: 'ping',
      description: 'Replies with Pong!',
      options: [],
    });
  } else {
    await interaction.acknowledge();

    let message = await interaction.createFollowup({
      embeds: [
        {
          description: `:chart_with_upwards_trend: Pong!`,
          color: 0x008000,
        },
      ],
    });

    let pong = message.timestamp - interaction.createdAt;
    let ws = await bot.shards.filter((shard) => shard.id === bot.guildShardMap[interaction.guildID])[0].latency;

    interaction.editMessage(message.id, {
      embeds: [
        {
          description: `:chart_with_upwards_trend: Pong!\n${pong}ms RTT Latency\n${ws}ms Shard Heartbeat`,
          color: 0x008000,
        },
      ],
    });
  }
};

module.exports = ping;
