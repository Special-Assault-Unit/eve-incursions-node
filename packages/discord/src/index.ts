import {AppDataSource} from './data-source';
import Redis from 'ioredis';
import {Client, Intents, MessageEmbed, TextChannel} from 'discord.js';
import {ApplicationCommandOptionTypes} from 'discord.js/typings/enums';
import {Channel} from './entity/Channel';
import type {SpawnChangeEvent} from '../../server/src/commands/updateSpawns';
import waitPort from 'wait-port';

const discord = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

const redis = new Redis({host: 'redis'});

(async () => {
  await waitPort({host: process.env.MYSQL_HOST, port: 3306});
  await AppDataSource.initialize();
  await discord.login(process.env.DISCORD_TOKEN);

  await redis.subscribe('spawn.change');

})();

discord.on('ready', () => {
  console.log('ready');
  const guildId = '875844114904662086';
  const guild = discord.guilds.cache.get(guildId);
  const commands = guild?.commands ?? discord.application?.commands;
  if (!commands) return;

  commands.create({
    name: 'set-channel',
    description: 'Setup the bot for this channel',
    options: [
      {
        name: 'channel',
        description: 'The channel you want the bot post into',
        required: true,
        type: ApplicationCommandOptionTypes.CHANNEL
      },
      {
        name: 'security-areas',
        description: 'The security areas you want the bot to notify you about',
        required: true,
        type: ApplicationCommandOptionTypes.STRING
      },
      {
        name: 'start-only',
        description: 'Will only post when new incursion starts',
        type: ApplicationCommandOptionTypes.BOOLEAN
      }
    ]
  });

  commands.create({
    name: 'remove-channel',
    description: 'Remove the channel from the bot\'s radar',
    options: [
      {
        name: 'channel',
        description: 'The channel you want the bot post into',
        required: true,
        type: ApplicationCommandOptionTypes.CHANNEL
      }
    ]
  });
});

discord.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const {commandName, options} = interaction;

  if (commandName === 'set-channel') {
    try {
      const channelId = options.getChannel('channel')!.id;
      const guildId = interaction.guildId;
      const securityAreas = options.getString('security-areas')!;
      const startOnly = options.getBoolean('start-only')!;
      const channel = interaction.guild?.channels.cache.get(channelId) as TextChannel;

      if (!channel?.isText()) throw new Error('The channel needs to be a TextChannel');

      const channelEntity = (await Channel.findOne({where: {channelId, guildId}})) ?? new Channel();
      channelEntity.channelId = channelId;
      channelEntity.guildId = guildId;
      channelEntity.high = securityAreas.includes('hs');
      channelEntity.low = false;
      channelEntity.null = false;
      channelEntity.startOnly = startOnly ?? false;

      await channelEntity.save();

      await interaction.reply({
        content: 'pong',
        ephemeral: true
      });
    } catch (e) {
      await interaction.reply({
        content: `Error: ${e}`,
        ephemeral: true
      });
    }

  } else if (commandName === 'remove-channel') {
    try {
      const channel = options.getChannel('channel')!;
      const guildId = interaction.guildId;

      const channelEntity = await Channel.findOne({where: {channelId: channel.id, guildId}});
      if (!channelEntity) throw new Error('Entry for the specified channel not found');
      await channelEntity.remove();

      await interaction.reply({
        content: `The bot will no longer post notifications in ${channel.name}`,
        ephemeral: true
      });
    } catch (e) {
      await interaction.reply({
        content: `Error: ${e}`,
        ephemeral: true
      });
    }
  }
});

redis.on('message', async (channel, message) => {
  const {spawns} = JSON.parse(message) as SpawnChangeEvent;

  for (const spawn of spawns) {
    const area = spawn.securityArea;
    const channelEntities = await Channel.find({
      where: {
        [area]: true,
        startOnly: spawn.state === "Established" ? undefined : false
      }
    });
    const embed = await createMessage(spawn);

    for await (const channelEntity of channelEntities) {
      const guild = discord.guilds.cache.get(channelEntity.guildId);
      const channel = guild?.channels.cache.get(channelEntity.channelId) as TextChannel;

      if (!guild || !channel || !channel.isText()) continue;

      await channel.send({
        embeds: [embed]
      });
    }
  }
});

const stateMap = {
  'established': {
    phrase: 'has been established',
    color: 0x0FA0CE
  },
  'mobilizing': {
    phrase: 'has mobilized',
    color: 0xDB0
  },
  'withdrawing': {
    phrase: 'is withdrawing',
    color: 0xC6C
  },
  'ended': {
    phrase: 'has ended',
    color: 0xA33
  }
} as const;

const createMessage = async (spawn: SpawnChangeEvent["spawns"][0]) => {
  const state = stateMap[spawn.state.toLocaleLowerCase() as keyof typeof stateMap];

  return new MessageEmbed({
    color: state.color,
    title: `Incursion in **${spawn.constellationName}** ${state.phrase}`,
    thumbnail: {
      url: `https://images.evetech.net/${spawn.sovereigntyHolderId < 600000 ? 'corporations' : 'alliances'}/${spawn.sovereigntyHolderId}/logo?size=64`
    },
    fields: [
      {
        name: 'State',
        value: spawn.state,
      },
      {
        name: 'Region',
        value: spawn.regionName,
        inline: true
      },
      {
        name: 'Stag. System',
        value: spawn.stagingSystemName,
        inline: true
      },
      {
        name: 'Sec. Status',
        value: `${spawn.securityArea ? '🟩' : spawn.securityArea === 'low' ? '🟧' : '🟥'} ${spawn.security}`,
        inline: true
      }
    ],
    timestamp: spawn.updatedAt
  });
};

