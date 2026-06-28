export type NotificationTransition = 'start' | 'end';

type NotificationRedis = {
  readonly get: (key: string) => Promise<string | null>;
  readonly set: (key: string, value: string, mode: 'EX', seconds: number) => Promise<unknown>;
}

const defaultTtlSeconds = 30 * 24 * 60 * 60;

export const shouldNotify = async (redis: NotificationRedis, transition: NotificationTransition, spawnId: number): Promise<boolean> => {
  const existing = await redis.get(notificationKey(transition, spawnId));
  return existing === null;
}

export const markNotified = async (redis: NotificationRedis, transition: NotificationTransition, spawnId: number, ttlSeconds = defaultTtlSeconds): Promise<void> => {
  await redis.set(notificationKey(transition, spawnId), '1', 'EX', ttlSeconds);
}

const notificationKey = (transition: NotificationTransition, spawnId: number): string => `notify:${transition}:${spawnId}`;
