// src/sanity/queries/worldRegions.ts
import { sanityFetch } from '@/sanity/lib/live';

export type WorldRegion = {
  _id: string;
  slug: string;
  title: string; // EN canonical
  titleIt: string; // IT label
  shortTitle: string;
  shortTitleIt: string;
  order?: number;
};

const WORLD_REGIONS_QUERY = /* groq */ `
  *[_type == "worldRegion"] | order(order asc, title asc) {
    _id,
    title,
    titleIt,
    shortTitle,
    shortTitleIt,
    "slug": slug.current,
    order
  }
`;

export async function getWorldRegions() {
  return sanityFetch<WorldRegion[]>({
    query: WORLD_REGIONS_QUERY,
    // worldRegion is infrastructure → cache hard
    revalidate: 60 * 60 * 24, // 24h
  });
}