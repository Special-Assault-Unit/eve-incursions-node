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
}

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

export const buildStartMessage = (context: SpawnNotificationContext): string => {
  return `Incursion started in ${context.regionName}: ${context.constellationName} / ${context.stagingSystemName} (${context.state})`;
}

export const buildEndMessage = (context: SpawnNotificationContext): string => {
  return `Incursion ended in ${context.regionName}: ${context.constellationName} / ${context.stagingSystemName}`;
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

    const message = transition === 'start' ? buildStartMessage(context) : buildEndMessage(context);
    await sendDiscordMessage(config.webhookUrl, message);
    await markNotified(redis, transition, spawnId);
  } catch (error) {
    console.error('[notify] Discord notification failed', error);
  }
}
