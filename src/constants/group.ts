export const GROUP_PREFIX = '[G3]';

export function hasGroupPrefix(title: string): boolean {
  return title.startsWith(GROUP_PREFIX);
}

export function withGroupPrefix(title: string): string {
  const trimmed = title.trim();
  return hasGroupPrefix(trimmed) ? trimmed : `${GROUP_PREFIX}${trimmed}`;
}
