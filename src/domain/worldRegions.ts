/*
 * World Region labels — SINGLE SOURCE OF TRUTH
 * Used by:
 * - seed scripts
 * - server pages
 * - UI (cards, pills, filters)
 */

export const WORLD_REGION_LABELS = {
  'east-asia-and-pacific': {
    title: { it: 'Asia Orientale e Pacifico', en: 'East Asia & Pacific' },
    shortTitle: { it: 'Asia Est & Pacifico', en: 'East Asia & Pacific' },
  },
  'europe-and-central-asia': {
    title: { it: 'Europa e Asia Centrale', en: 'Europe & Central Asia' },
    shortTitle: { it: 'Europa & Asia Centrale', en: 'Europe & Central Asia' },
  },
  'latin-america-and-caribbean': {
    title: { it: 'America Latina e Caraibi', en: 'Latin America & Caribbean' },
    shortTitle: { it: 'America Latina & Caraibi', en: 'Latin America & Caribbean' },
  },
  'middle-east-north-africa-afghanistan-and-pakistan': {
    title: {
      it: 'Medio Oriente e Nord Africa (Afghanistan e Pakistan)',
      en: 'Middle East & North Africa (Afghanistan & Pakistan)',
    },
    shortTitle: { it: 'Medio Oriente & Nord Africa', en: 'Middle East & North Africa' },
  },
  'north-america': {
    title: { it: 'Nord America', en: 'North America' },
    shortTitle: { it: 'Nord America', en: 'North America' },
  },
  'south-asia': {
    title: { it: 'Asia Meridionale', en: 'South Asia' },
    shortTitle: { it: 'Asia del Sud', en: 'South Asia' },
  },
  'sub-saharan-africa': {
    title: { it: 'Africa Sub-sahariana', en: 'Sub-Saharan Africa' },
    shortTitle: { it: 'Africa Subsahariana', en: 'Sub-Saharan Africa' },
  },
} as const;

export type WorldRegionSlug = keyof typeof WORLD_REGION_LABELS;

export type Lang = 'it' | 'en';

const FALLBACK = { it: 'Altro', en: 'Other' } as const;

export function getRegionTitle(slug?: string, lang: Lang = 'it') {
  if (!slug) return FALLBACK[lang];
  return (
    WORLD_REGION_LABELS[slug as WorldRegionSlug]?.title?.[lang] ??
    FALLBACK[lang]
  );
}

export function getRegionShortTitle(slug?: string, lang: Lang = 'it') {
  if (!slug) return FALLBACK[lang];
  return (
    WORLD_REGION_LABELS[slug as WorldRegionSlug]?.shortTitle?.[lang] ??
    FALLBACK[lang]
  );
}
