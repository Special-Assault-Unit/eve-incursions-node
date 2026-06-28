import {describe, expect, it, vi} from 'vitest';
import {markNotified, shouldNotify} from './dedupe';

describe('notification dedupe', () => {
  it('allows notification when no dedupe key exists', async () => {
    const redis = {get: vi.fn().mockResolvedValue(null), set: vi.fn()};

    await expect(shouldNotify(redis, 'start', 42)).resolves.toBe(true);
    expect(redis.get).toHaveBeenCalledWith('notify:start:42');
  });

  it('blocks notification when a dedupe key exists', async () => {
    const redis = {get: vi.fn().mockResolvedValue('1'), set: vi.fn()};

    await expect(shouldNotify(redis, 'end', 42)).resolves.toBe(false);
  });

  it('marks notifications with the default ttl', async () => {
    const redis = {get: vi.fn(), set: vi.fn().mockResolvedValue('OK')};

    await markNotified(redis, 'start', 42);

    expect(redis.set).toHaveBeenCalledWith('notify:start:42', '1', 'EX', 2_592_000);
  });
});
