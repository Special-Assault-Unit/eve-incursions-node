import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {loadNotificationConfig} from './config';

describe('loadNotificationConfig', () => {
  const originalEnv = {...process.env};

  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    process.env = {...originalEnv};
    delete process.env.DISCORD_WEBHOOK_URL;
    delete process.env.NOTIFICATION_FILTERS;
    delete process.env.APP_BASE_URL;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = originalEnv;
  });

  it('enables notifications when webhook and region filters are configured', () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    process.env.NOTIFICATION_FILTERS = '[{"regionNames":[" Innsmother ","Delve"]}]';

    const config = loadNotificationConfig();

    expect(config).toEqual({
      enabled: true,
      webhookUrl: 'https://discord.com/api/webhooks/test',
      appBaseUrl: undefined,
      filters: [{regionNames: ['Innsmother', 'Delve']}],
    });
  });

  it('captures APP_BASE_URL when configured', () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    process.env.NOTIFICATION_FILTERS = '[{"regionNames":["Insmother"]}]';
    process.env.APP_BASE_URL = 'https://incursion.xsaux.com';

    const config = loadNotificationConfig();

    expect(config).toEqual({
      enabled: true,
      webhookUrl: 'https://discord.com/api/webhooks/test',
      appBaseUrl: 'https://incursion.xsaux.com',
      filters: [{regionNames: ['Insmother']}],
    });
  });

  it('disables notifications when webhook URL is missing', () => {
    process.env.NOTIFICATION_FILTERS = '[{"regionNames":["Innsmother"]}]';

    const config = loadNotificationConfig();

    expect(config.enabled).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('DISCORD_WEBHOOK_URL'));
  });

  it('disables notifications when filter JSON is malformed', () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    process.env.NOTIFICATION_FILTERS = 'not json';

    const config = loadNotificationConfig();

    expect(config.enabled).toBe(false);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('NOTIFICATION_FILTERS'));
  });

  it('disables notifications when filters contain no region names', () => {
    process.env.DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/test';
    process.env.NOTIFICATION_FILTERS = '[{"regionNames":["   "]}]';

    const config = loadNotificationConfig();

    expect(config.enabled).toBe(false);
  });
});
