// src/sanity/queries/destinations.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type WorldRegionRef = {
  title: string; // EN canonical
  titleIt: string; // IT label
  slug: string;
  order?: number;
} | null;

export type CountryForDestinations = {
  _id: string;
  title: string;
  slug: string;
  worldRegion: WorldRegionRef;

  /** Number of published (or preview) posts referencing this country */
  postCount: number;

  /** Optional cover image for the destination card.
   * Priority: Country.destinationCover (manual) → latest related post cardImage (fallback).
   */
  coverImage?: SanityImageSource | null;
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
  *[_type == "country"] | order(title asc) {
    _id,
    title,
    "slug": slug.current,

    // Region grouping (World Bank) for UI filters
    worldRegion->{
      title,
      titleIt,
      "slug": slug.current,
      order
    },

    // Number of related posts for this country.
    // We use references(^._id) because Posts store countries[] as references.
    "postCount": count(*[
      _type == "post" &&
      references(^._id)
    ]),

    // Card cover image (Sanity image object), with a manual override.
    "coverImage": coalesce(
      // Manual override set on the Country doc in Studio
      destinationCover->image,

      // Fallback to latest related post's cardImage
      *[
        _type == "post" &&
        (status == "published" || $preview == true) &&
        references(^._id)
      ] | order(_updatedAt desc)[0].cardImage->image
    )
  }
`;

export async function getCountriesForDestinations(options?: { preview?: boolean }) {
  const sanityClient = options?.preview ? previewClient : client;

  return sanityClient.fetch<CountryForDestinations[]>(
    COUNTRIES_FOR_DESTINATIONS_QUERY,
    { preview: options?.preview ?? false },
    options?.preview
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 * 60 * 24 } }, // 24h
  );
}
