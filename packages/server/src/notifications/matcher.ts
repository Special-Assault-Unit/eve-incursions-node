import type {NotificationConfig} from './config';

export const matchesRegion = (regionName: string, config: NotificationConfig): boolean => {
  if (!config.enabled) return false;

  const normalizedRegionName = regionName.toLocaleLowerCase();
  return config.filters.some(filter => filter.regionNames.some(candidate => candidate.toLocaleLowerCase() === normalizedRegionName));
}
