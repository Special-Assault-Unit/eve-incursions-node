import {Spawn} from '../models/Spawn';
import {redis} from '../lib/redis';
import {loadNotificationConfig} from './config';
import {matchesRegion} from './matcher';
import {markNotified, shouldNotify, type NotificationTransition} from './dedupe';

type SpawnNotificationContext = {
  readonly spawnId: number;
  readonly regionName: string;
  readonly constellationName: string;
  readonly stagingSystemName: string;
  readonly state: string;
  readonly boss: boolean;
  readonly influencePct: number;
  readonly security: number;
  readonly securityArea: string;
  readonly sovId: number;
  readonly sovName: string;
  readonly establishedAt: string;
}

type DiscordEmbedField = {
  readonly name: string;
  readonly value: string;
  readonly inline?: boolean;
}

type DiscordEmbed = {
  readonly title: string;
  readonly url: string;
  readonly color: number;
  readonly thumbnail?: {readonly url: string};
  readonly fields: readonly DiscordEmbedField[];
  readonly timestamp: string;
  readonly footer: {readonly text: string};
}

const startColor = 0x2ecc71;
const endColor = 0xe74c3c;

// Mirror of the frontend dotlanTransform (spaces -> underscores) so embed links
// match the web app's dotlan deep links without importing across packages.
const dotlanTransform = (name: string): string => name.replace(/ /g, '_');

const dotlanRegionMapUrl = (regionName: string, constellationName: string): string =>
  `https://evemaps.dotlan.net/map/${dotlanTransform(regionName)}/${dotlanTransform(constellationName)}#radius`;

const sovLogoUrl = (sovId: number): string =>
  `https://images.evetech.net/${sovId < 600000 ? 'corporations' : 'alliances'}/${sovId}/logo?size=64`;

export const sendDiscordMessage = async (webhookUrl: string, content: string): Promise<void> => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content}),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}

export const sendDiscordEmbed = async (webhookUrl: string, embed: DiscordEmbed): Promise<void> => {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({embeds: [embed]}),
  });

  if (!response.ok) {
    throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
  }
}

export const buildStartEmbed = (context: SpawnNotificationContext, appBaseUrl: string | undefined): DiscordEmbed => {
  const url = appBaseUrl
    ? `${appBaseUrl.replace(/\/$/, '')}/#spawn-${context.spawnId}`
    : dotlanRegionMapUrl(context.regionName, context.constellationName);

  const embed: DiscordEmbed = {
    title: `🟢 Incursion Started — ${context.regionName}`,
    url,
    color: startColor,
    fields: [
      {name: 'Constellation', value: context.constellationName, inline: true},
      {name: 'Staging', value: `${context.stagingSystemName} (${context.security})`, inline: true},
      {name: 'Security Area', value: context.securityArea, inline: true},
      {name: 'Sovereignty', value: context.sovName || 'Unknown', inline: true},
      {name: 'State', value: context.boss ? `${context.state} · Boss` : context.state, inline: true},
      {name: 'Influence', value: `${context.influencePct}%`, inline: true},
    ],
    timestamp: context.establishedAt,
    footer: {text: 'EVE Incursions'},
  };

  return context.sovId > 0 ? {...embed, thumbnail: {url: sovLogoUrl(context.sovId)}} : embed;
}

export const buildEndEmbed = (context: SpawnNotificationContext): DiscordEmbed => {
  const embed: DiscordEmbed = {
    title: `🔴 Incursion Ended — ${context.regionName}`,
    url: dotlanRegionMapUrl(context.regionName, context.constellationName),
    color: endColor,
    fields: [
      {name: 'Constellation', value: context.constellationName, inline: true},
      {name: 'Staging', value: `${context.stagingSystemName} (${context.security})`, inline: true},
      {name: 'Security Area', value: context.securityArea, inline: true},
      {name: 'Sovereignty', value: context.sovName || 'Unknown', inline: true},
    ],
    timestamp: new Date().toISOString(),
    footer: {text: 'EVE Incursions'},
  };

  return context.sovId > 0 ? {...embed, thumbnail: {url: sovLogoUrl(context.sovId)}} : embed;
}

export const loadSpawnContext = async (spawnId: number): Promise<SpawnNotificationContext | null> => {
  const spawn = await Spawn.findOne({where: {id: spawnId}});
  if (!spawn) return null;

  const stagingSystem = await spawn.stagingSystem;
  const constellation = await stagingSystem?.constellation;
  const region = await constellation?.region;
  if (!stagingSystem || !constellation || !region) return null;

  return {
    spawnId,
    regionName: region.name,
    constellationName: constellation.name,
    stagingSystemName: stagingSystem.name,
    state: spawn.state,
    boss: spawn.boss,
    influencePct: Math.round(spawn.influence * 100),
    security: stagingSystem.security,
    securityArea: stagingSystem.securityArea,
    sovId: stagingSystem.sovereigntyHolderID,
    sovName: stagingSystem.sovereigntyHolderName,
    establishedAt: spawn.establishedAt.toISOString(),
  };
}

export const notifySpawnTransitions = async (spawnIds: readonly number[], transition: NotificationTransition): Promise<void> => {
  const config = loadNotificationConfig();
  if (!config.enabled) return;

  for (const spawnId of spawnIds) {
    await notifySpawnTransition(spawnId, transition, config);
  }
}

const notifySpawnTransition = async (spawnId: number, transition: NotificationTransition, config: ReturnType<typeof loadNotificationConfig>): Promise<void> => {
  try {
    if (!config.enabled) return;
    if (!await shouldNotify(redis, transition, spawnId)) return;

    const context = await loadSpawnContext(spawnId);
    if (!context) return;

    if (!matchesRegion(context.regionName, config)) {
      await markNotified(redis, transition, spawnId);
      return;
    }

    const embed = transition === 'start'
      ? buildStartEmbed(context, config.appBaseUrl)
      : buildEndEmbed(context);
    await sendDiscordEmbed(config.webhookUrl, embed);
    await markNotified(redis, transition, spawnId);
  } catch (error) {
    console.error('[notify] Discord notification failed', error);
  }
}
