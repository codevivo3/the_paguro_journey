// src/sanity/queries/destinations.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type WorldRegionRef = {
  /** Resolved title for requested language */
  title: string;

  /** Optional raw i18n titles (future toggle use) */
  titleI18n?: { it?: string; en?: string };

  slug: string;
  order?: number;
} | null;

export type CountryForDestinations = {
  _id: string;

  /** Preferred display name (short/common) for requested language */
  name: string;
  nameI18n?: { it?: string; en?: string };

  /** Back-compat (older components may still read `title`) */
  title: string;
  titleI18n?: { it?: string; en?: string };

  slug: string;
  worldRegion: WorldRegionRef;

  /** Number of published (or preview) posts referencing this country */
  postCount: number;

  /** Optional cover image for the destination card.
   * Priority: Country.destinationCover (manual) → latest related post cardImage (fallback).
   */
  coverImage?: SanityImageSource | null;

  /**
   * Travel styles inferred from related posts (Option A).
   * Distinct list, suitable for filter pills.
   */
  travelStyles?: Array<{
    slug: string;
    label: string;
    titleI18n?: { it?: string; en?: string };
    order?: number;
  }>;
};

const COUNTRIES_FOR_DESTINATIONS_QUERY = /* groq */ `
  // Destinations (cards) are derived from Countries.
  //
  // Rules:
  // 1) Only show a Country as a destination if it has at least 1 related Post.
  // 2) In normal mode, only Posts with status == "published" count.
  // 3) In Draft/Preview mode, drafts also count (because $preview == true).
  // 4) Cover image priority:
  //    - If Country has destinationCover (a reference to mediaItem), use that.
  //    - Else, fall back to the latest related Post cardImage.
  *[_type == "country"] | order(coalesce(nameI18n[$lang], titleI18n[$lang], title) asc) {
    _id,

    nameI18n,
    "name": coalesce(nameI18n[$lang], titleI18n[$lang], title),

    titleI18n,
    "title": coalesce(nameI18n[$lang], titleI18n[$lang], title),

    "slug": slug.current,

    worldRegion->{
      titleI18n,
      "title": coalesce(titleI18n[$lang], title),
      "slug": slug.current,
      order
    },

    "postCount": count(*[
      _type == "post" &&
      (status == "published" || $preview == true) &&
      references(^._id)
    ]),

    "travelStyles": array::unique(*[
      _type == "post" &&
      (status == "published" || $preview == true) &&
      references(^._id)
    ].travelStyles[]-> {
      "slug": slug.current,
      titleI18n,
      "label": coalesce(titleI18n[$lang], title),
      order
    }) | order(order asc, label asc),

    "coverImage": coalesce(
      destinationCover->image,

      *[
        _type == "post" &&
        (status == "published" || $preview == true) &&
        references(^._id)
      ] | order(_updatedAt desc)[0].cardImage->image
    )
  }
`;

export async function getCountriesForDestinations(options?: {
  preview?: boolean;
  lang?: 'it' | 'en';
}) {
  const sanityClient = options?.preview ? previewClient : client;

  return sanityClient.fetch<CountryForDestinations[]>(
    COUNTRIES_FOR_DESTINATIONS_QUERY,
    { preview: options?.preview ?? false, lang: options?.lang ?? 'it' },
    options?.preview || process.env.NODE_ENV !== 'production'
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 * 60 * 24 } }, // 24h
  );
}
