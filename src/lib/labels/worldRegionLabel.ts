import type { WorldRegion } from '@/sanity/queries/worldRegions';

/**
 * Returns the correct label for a World Bank world region based on locale.
 *
 * Notes:
 * - `worldRegion.title` is the canonical EN label (seeded, stable).
 * - `worldRegion.titleIt` is the IT label (seeded).
 * - Fallbacks are defensive so UI never shows "undefined".
 */
type WorldRegionLabelInput = {
  title?: string | null;
  /** Optional Italian label (some query types don’t include this field) */
  titleIt?: string | null;
  /** Defensive alias in case the field is named differently in some queries */
  title_it?: string | null;
};

export function worldRegionLabel(
  wr: WorldRegionLabelInput | null | undefined,
  locale: 'it' | 'en',
) {
  if (!wr) return '';
  if (locale === 'en') return wr.title ?? '';
  return wr.titleIt ?? wr.title_it ?? wr.title ?? '';
}