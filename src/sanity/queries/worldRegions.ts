// src/sanity/queries/worldRegions.ts
import { sanityFetch } from '@/sanity/lib/live';

export type WorldRegion = {
  _id: string;
  slug: string;

  /** Resolved titles for requested language */
  title: string;
  shortTitle?: string;

  /** Raw i18n objects (optional, for future toggle use) */
  titleI18n?: { it?: string; en?: string };
  shortTitleI18n?: { it?: string; en?: string };

  order?: number;
};

const WORLD_REGIONS_QUERY = /* groq */ `
  *[_type == "worldRegion"]
  | order(order asc, coalesce(titleI18n[$lang], title) asc) {
    _id,
    titleI18n,
    shortTitleI18n,

    "title": coalesce(titleI18n[$lang], title),
    "shortTitle": coalesce(shortTitleI18n[$lang], shortTitle),

    "slug": slug.current,
    order
  }
`;

export async function getWorldRegions(lang: 'it' | 'en' = 'it') {
  return sanityFetch<WorldRegion[]>({
    query: WORLD_REGIONS_QUERY,
    params: { lang },
    // worldRegion is infrastructure → cache hard
    revalidate: 60 * 60 * 24, // 24h
  });
}