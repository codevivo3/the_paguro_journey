export function worldRegionLabel(
  worldRegion: { title?: string; titleIt?: string } | null | undefined,
  locale: string,
) {
  if (!worldRegion) return '';
  return locale === 'it'
    ? (worldRegion.titleIt ?? worldRegion.title ?? '')
    : (worldRegion.title ?? worldRegion.titleIt ?? '');
}
