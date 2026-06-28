import {beforeEach, describe, expect, it, vi} from 'vitest';

const {mockEsiRequest, mockEnsureConstellationData, mockRedis, mockTransaction, mockSave, mockSpawnFindOne, mockSpawnFind, mockSystemFindOne, mockSystemFindOneBy, mockNotifySpawnTransitions} = vi.hoisted(() => ({
  mockEsiRequest: vi.fn(),
  mockEnsureConstellationData: vi.fn(),
  mockRedis: {del: vi.fn(), publish: vi.fn()},
  mockTransaction: vi.fn(),
  mockSave: vi.fn(),
  mockSpawnFindOne: vi.fn(),
  mockSpawnFind: vi.fn(),
  mockSystemFindOne: vi.fn(),
  mockSystemFindOneBy: vi.fn(),
  mockNotifySpawnTransitions: vi.fn(),
}));

vi.mock('../lib/esi', () => ({esiRequest: mockEsiRequest}));
vi.mock('./ensureConstellationData', () => ({ensureConstellationData: mockEnsureConstellationData}));
vi.mock('../lib/redis', () => ({redis: mockRedis}));
vi.mock('../lib/data-source', () => ({
  AppDataSource: {
    manager: {
      transaction: mockTransaction,
    },
  },
}));
vi.mock('../notifications/discord', () => ({notifySpawnTransitions: mockNotifySpawnTransitions}));
vi.mock('../models/InfluenceLogEntry', () => ({
  InfluenceLogEntry: class MockInfluenceLogEntry {
    influence = 0;
    spawnId = 0;
    date = new Date();
  },
}));
vi.mock('../models/SpawnLog', () => ({
  SpawnLog: class MockSpawnLog {
    state = '';
    date = new Date();
    spawnId = 0;
  },
}));
vi.mock('../models/System', () => ({
  System: {
    findOne: mockSystemFindOne,
    findOneBy: mockSystemFindOneBy,
  },
}));
vi.mock('../models/Spawn', () => ({
  Spawn: class MockSpawn {
    static findOne = mockSpawnFindOne;
    static find = mockSpawnFind;
    id = 0;
    state = '';
    active = false;
    boss = false;
    influence = 0;
    constellationId = 0;
    type = 0;
    establishedAt = new Date();
    endedAt = new Date();
    updatedAt = new Date('2026-01-01T00:00:00.000Z');
    stagingSystem = Promise.resolve({
      name: 'Test Staging',
      security: 0.5,
      securityArea: 'HS',
      sovereigntyHolderID: 0,
      constellation: Promise.resolve({
        name: 'Test Constellation',
        region: Promise.resolve({name: 'Innsmother'}),
      }),
    });
  },
}));

import {updateSpawns} from './updateSpawns';

describe('updateSpawns notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let nextSpawnId = 42;
    mockTransaction.mockImplementation(async callback => callback({save: mockSave}));
    mockSave.mockImplementation(async entity => {
      if ('constellationId' in entity && entity.id === 0) {
        entity.id = nextSpawnId;
        nextSpawnId += 1;
      }
      return entity;
    });
    mockRedis.del.mockResolvedValue(1);
    mockRedis.publish.mockResolvedValue(1);
    mockEnsureConstellationData.mockResolvedValue(undefined);
    mockNotifySpawnTransitions.mockResolvedValue(undefined);
    mockSystemFindOne.mockResolvedValue(null);
    mockSystemFindOneBy.mockResolvedValue({id: 30000001, type: 'not known'});
    mockSpawnFind.mockImplementation(async () => [spawnContext(42)]);
  });

  it('notifies once for a newly created incursion spawn', async () => {
    mockEsiRequest.mockResolvedValue([apiSpawn(20000001, 30000001, 'established')]);
    mockSpawnFindOne.mockResolvedValue(null);

    await updateSpawns();

    expect(mockNotifySpawnTransitions).toHaveBeenCalledWith([42], 'start');
    expect(mockRedis.publish).toHaveBeenCalledWith('spawn.change', expect.stringContaining('Innsmother'));
  });

  it('notifies once for an ended incursion spawn', async () => {
    const endedSpawn = spawnContext(42);
    endedSpawn.active = true;
    mockEsiRequest.mockResolvedValue([]);
    mockSpawnFind.mockResolvedValueOnce([endedSpawn]).mockResolvedValueOnce([endedSpawn]);

    await updateSpawns();

    expect(mockNotifySpawnTransitions).toHaveBeenCalledWith([42], 'end');
  });

  it('does not send start or end notifications for state-only updates', async () => {
    const existingSpawn = spawnContext(42);
    existingSpawn.state = 'Mobilizing';
    mockEsiRequest.mockResolvedValue([apiSpawn(20000001, 30000001, 'established')]);
    mockSpawnFindOne.mockResolvedValue(existingSpawn);
    mockSpawnFind.mockResolvedValueOnce([]).mockResolvedValueOnce([existingSpawn]);

    await updateSpawns();

    expect(mockNotifySpawnTransitions).not.toHaveBeenCalled();
  });

  it('keeps publishing spawn changes when notification batches reject', async () => {
    mockEsiRequest.mockResolvedValue([apiSpawn(20000001, 30000001, 'established')]);
    mockSpawnFindOne.mockResolvedValue(null);
    mockNotifySpawnTransitions.mockRejectedValue(new Error('webhook down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await updateSpawns();

    expect(mockRedis.publish).toHaveBeenCalledWith('spawn.change', expect.stringContaining('Innsmother'));
  });
});

const apiSpawn = (constellationId: number, stagingSystemId: number, state: string) => ({
  constellation_id: constellationId,
  faction_id: 500019,
  has_boss: false,
  infested_solar_systems: [stagingSystemId],
  influence: 0.5,
  staging_solar_system_id: stagingSystemId,
  state,
  type: 'Incursion',
});

const spawnContext = (id: number) => ({
  id,
  state: 'Established',
  active: true,
  boss: false,
  influence: 0.5,
  constellationId: 20000001,
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  stagingSystem: Promise.resolve({
    name: 'Test Staging',
    security: 0.5,
    securityArea: 'HS',
    sovereigntyHolderID: 0,
    constellation: Promise.resolve({
      name: 'Test Constellation',
      region: Promise.resolve({name: 'Innsmother'}),
    }),
  }),
});
