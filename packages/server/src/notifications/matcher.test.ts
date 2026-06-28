import {describe, expect, it} from 'vitest';
import {matchesRegion} from './matcher';
import type {NotificationConfig} from './config';

describe('matchesRegion', () => {
  const enabledConfig: NotificationConfig = {
    enabled: true,
    webhookUrl: 'https://discord.com/api/webhooks/test',
    filters: [{regionNames: ['Innsmother']}, {regionNames: ['Delve']}],
  };

  it('matches exact region names', () => {
    expect(matchesRegion('Innsmother', enabledConfig)).toBe(true);
  });

  it('matches region names case-insensitively', () => {
    expect(matchesRegion('innsmother', enabledConfig)).toBe(true);
  });

  it('rejects partial region names', () => {
    expect(matchesRegion('Inner Innsmother', enabledConfig)).toBe(false);
  });

  it('returns false when notifications are disabled', () => {
    const disabledConfig: NotificationConfig = {enabled: false};

    expect(matchesRegion('Innsmother', disabledConfig)).toBe(false);
  });
});
