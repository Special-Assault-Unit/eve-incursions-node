export type NotificationFilter = {
  readonly regionNames: readonly string[];
}

export type NotificationConfig = {
  readonly enabled: false;
} | {
  readonly enabled: true;
  readonly webhookUrl: string;
  readonly filters: readonly NotificationFilter[];
}

type RawNotificationFilter = {
  readonly regionNames?: unknown;
}

export const loadNotificationConfig = (): NotificationConfig => {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL?.trim();
  if (!webhookUrl) {
    console.warn('Discord notifications disabled: DISCORD_WEBHOOK_URL is not configured');
    return {enabled: false};
  }

  const rawFilters = process.env.NOTIFICATION_FILTERS;
  if (!rawFilters) {
    console.warn('Discord notifications disabled: NOTIFICATION_FILTERS is not configured');
    return {enabled: false};
  }

  try {
    const parsed: unknown = JSON.parse(rawFilters);
    if (!Array.isArray(parsed)) {
      console.warn('Discord notifications disabled: NOTIFICATION_FILTERS must be a JSON array');
      return {enabled: false};
    }

    const filters = parsed
      .map(parseFilter)
      .filter((filter): filter is NotificationFilter => filter.regionNames.length > 0);

    if (filters.length === 0) {
      console.warn('Discord notifications disabled: NOTIFICATION_FILTERS contains no region names');
      return {enabled: false};
    }

    return {enabled: true, webhookUrl, filters};
  } catch (error) {
    console.warn('Discord notifications disabled: NOTIFICATION_FILTERS is invalid JSON');
    return {enabled: false};
  }
}

const parseFilter = (filter: RawNotificationFilter): NotificationFilter => {
  if (!Array.isArray(filter.regionNames)) return {regionNames: []};

  return {
    regionNames: filter.regionNames
      .filter((regionName): regionName is string => typeof regionName === 'string')
      .map(regionName => regionName.trim())
      .filter(regionName => regionName.length > 0),
  };
}
