import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {mockRedis, mockFindOne, mockLoadConfig, mockMatchesRegion} = vi.hoisted(() => ({
  mockRedis: {get: vi.fn(), set: vi.fn()},
  mockFindOne: vi.fn(),
  mockLoadConfig: vi.fn(),
  mockMatchesRegion: vi.fn(),
}));

vi.mock('../lib/redis', () => ({redis: mockRedis}));
vi.mock('../models/Spawn', () => ({
  Spawn: {
    findOne: mockFindOne,
  },
}));
vi.mock('./config', () => ({loadNotificationConfig: mockLoadConfig}));
vi.mock('./matcher', () => ({matchesRegion: mockMatchesRegion}));

import {notifySpawnTransitions, sendDiscordMessage} from './discord';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('Discord notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRedis.get.mockResolvedValue(null);
    mockRedis.set.mockResolvedValue('OK');
    mockFetch.mockResolvedValue({ok: true, status: 204, statusText: 'No Content'});
    mockLoadConfig.mockReturnValue({
      enabled: true,
      webhookUrl: 'https://discord.com/api/webhooks/test',
      appBaseUrl: 'https://incursion.xsaux.com',
      filters: [{regionNames: ['Insmother']}],
    });
    mockMatchesRegion.mockReturnValue(true);
    mockFindOne.mockResolvedValue(spawnWithRegion('Insmother'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('posts a Discord embed and marks a matching start notification', async () => {
    await notifySpawnTransitions([42], 'start');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({method: 'POST'})
    );

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body).toHaveProperty('embeds');
    expect(Array.isArray(body.embeds)).toBe(true);
    expect(body.embeds[0].url).toBe('https://incursion.xsaux.com/#spawn-42');
    expect(mockRedis.set).toHaveBeenCalledWith('notify:start:42', '1', 'EX', 2_592_000);
  });

  it('does not mark a webhook failure so the next scheduler cycle can retry', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 500, statusText: 'Server Error'});

    await notifySpawnTransitions([42], 'end');

    expect(console.error).toHaveBeenCalled();
    expect(mockRedis.set).not.toHaveBeenCalled();
  });

  it('marks non-matching regions without sending a webhook', async () => {
    mockMatchesRegion.mockReturnValue(false);

    await notifySpawnTransitions([42], 'start');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockRedis.set).toHaveBeenCalledWith('notify:start:42', '1', 'EX', 2_592_000);
  });

  it('skips missing spawn context without throwing', async () => {
    mockFindOne.mockResolvedValue(null);

    await notifySpawnTransitions([42], 'start');

    expect(mockFetch).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('throws from direct Discord send on non-2xx response', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 400, statusText: 'Bad Request'});

    await expect(sendDiscordMessage('https://discord.test/webhook', 'hello')).rejects.toThrow('Discord webhook failed: 400 Bad Request');
  });
});

const spawnWithRegion = (regionName: string) => ({
  id: 42,
  state: 'Established',
  boss: false,
  influence: 0,
  establishedAt: new Date('2026-05-01T20:15:01.000Z'),
  stagingSystem: Promise.resolve({
    name: 'Test Staging',
    security: -0.1,
    securityArea: 'null',
    sovereigntyHolderID: 99000001,
    sovereigntyHolderName: 'Test Sov',
    constellation: Promise.resolve({
      name: 'Test Constellation',
      region: Promise.resolve({name: regionName}),
    }),
  }),
});
