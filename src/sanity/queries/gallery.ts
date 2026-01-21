// src/sanity/queries/gallery.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type SanityGalleryItem = {
  _id: string;
  _createdAt?: string;
  title?: string;
  alt?: string;
  caption?: string;
  /** Sanity image field (matches `mediaItem.image`) */
  image: SanityImageSource;
  countries?: Array<{ title?: string; slug?: string }>;
  regions?: Array<{ title?: string; slug?: string }>;
  travelStyles?: Array<{ title?: string; slug?: string }>;
};

const GALLERY_QUERY = /* groq */ `
  *[
    _type == "mediaItem" &&
    type == "image" &&
    defined(image.asset) &&

    // Editorial switch: if true, this media item must NOT appear in the public gallery
    // (used for About/Cover or any non-gallery visuals)
    excludeFromGallery != true
  ]
  | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    alt,
    caption,
    orientation,

    // Keep a stable key name for the frontend mapper
    "image": image,

    countries[]->{
      title,
      "slug": slug.current
    },
    regions[]->{
      title,
      "slug": slug.current
    },
    travelStyles[]->{
      title,
      "slug": slug.current
    }
  }
`;

/**
 * Fetch gallery items.
 * - In normal mode: cached + revalidated (fast)
 * - In Draft/Preview mode: no-store (fresh drafts instantly)
 * - Uses the same query for both modes; the client + caching policy controls draft freshness.
 */
export async function getGalleryItems(options?: { preview?: boolean }) {
  const sanityClient = options?.preview ? previewClient : client;

  return sanityClient.fetch<SanityGalleryItem[]>(
    GALLERY_QUERY,
    { preview: options?.preview ?? false },
    options?.preview
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 * 60 * 24 } }, // 24h
  );
}
