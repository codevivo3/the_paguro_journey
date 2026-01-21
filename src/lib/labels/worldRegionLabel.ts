import type { WorldRegion } from '@/sanity/queries/worldRegions';

/**
 * Returns the correct label for a World Bank world region based on locale.
 *
 * Notes:
 * - `worldRegion.title` is the canonical EN label (seeded, stable).
 * - `worldRegion.titleIt` is the IT label (seeded).
 * - Fallbacks are defensive so UI never shows "undefined".
 */
export function worldRegionLabel(
  wr: Pick<WorldRegion, 'title' | 'titleIt'> | null | undefined,
  locale: 'it' | 'en',
) {
  if (!wr) return '';
  if (locale === 'en') return wr.title ?? '';
  return wr.titleIt ?? wr.title ?? '';
}