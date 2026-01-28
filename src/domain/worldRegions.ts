/**
 * World Region labels — SINGLE SOURCE OF TRUTH
 * Used by:
 * - seed scripts
 * - server pages
 * - UI (cards, pills, filters)
 */

export const WORLD_REGION_LABELS = {
  'east-asia-and-pacific': {
    titleIt: 'Asia Orientale e Pacifico',
    shortTitle: 'East Asia & Pacific',
    shortTitleIt: 'Asia Est & Pacifico',
  },
  'europe-and-central-asia': {
    titleIt: 'Europa e Asia Centrale',
    shortTitle: 'Europe & Central Asia',
    shortTitleIt: 'Europa & Asia Centrale',
  },
  'latin-america-and-caribbean': {
    titleIt: 'America Latina e Caraibi',
    shortTitle: 'Latin America & Caribbean',
    shortTitleIt: 'America Latina & Caraibi',
  },
  'middle-east-north-africa-afghanistan-and-pakistan': {
    titleIt: 'Medio Oriente e Nord Africa (Afghanistan e Pakistan)',
    shortTitle: 'Middle East & North Africa',
    shortTitleIt: 'Medio Oriente & Nord Africa',
  },
  'north-america': {
    titleIt: 'Nord America',
    shortTitle: 'North America',
    shortTitleIt: 'Nord America',
  },
  'south-asia': {
    titleIt: 'Asia Meridionale',
    shortTitle: 'South Asia',
    shortTitleIt: 'Asia del Sud',
  },
  'sub-saharan-africa': {
    titleIt: 'Africa Sub-sahariana',
    shortTitle: 'Sub-Saharan Africa',
    shortTitleIt: 'Africa Subsahariana',
  },
} as const;

export type WorldRegionSlug = keyof typeof WORLD_REGION_LABELS;

export function getRegionShortTitleIt(slug?: string) {
  if (!slug) return 'Altro';
  return WORLD_REGION_LABELS[slug as WorldRegionSlug]?.shortTitleIt ?? 'Altro';
}
