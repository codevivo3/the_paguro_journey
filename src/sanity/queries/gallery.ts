// src/sanity/queries/gallery.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type SanityGalleryItem = {
  _id: string;
  _createdAt?: string;

  /** Optional internal title */
  title?: string;

  /** SEO alt (EN-only) */
  alt?: string;

  /** Accessibility-only localized alt */
  altI18n?: { it?: string; en?: string };

  /** Optional legacy caption */
  caption?: string;

  /** Optional localized caption */
  captionI18n?: { it?: string; en?: string };

  /** Resolved fields for requested language */
  captionResolved?: string;
  altA11yResolved?: string;

  orientation?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /** Sanity image field (matches `mediaItem.image`) */
  image: SanityImageSource;

  countries?: Array<{ title: string; titleI18n?: { it?: string; en?: string }; slug?: string }>;
  regions?: Array<{ title: string; titleI18n?: { it?: string; en?: string }; slug?: string }>;
  travelStyles?: Array<{ title: string; titleI18n?: { it?: string; en?: string }; slug?: string }>;
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
    altI18n,
    caption,
    captionI18n,
    orientation,

    // Resolved i18n helpers
    "captionResolved": coalesce(captionI18n[$lang], caption),
    "altA11yResolved": coalesce(altI18n[$lang], alt),

    // Keep a stable key name for the frontend mapper
    "image": image,

    countries[]->{
      titleI18n,
      "title": coalesce(titleI18n[$lang], title),
      "slug": slug.current
    },
    regions[]->{
      titleI18n,
      "title": coalesce(titleI18n[$lang], title),
      "slug": slug.current
    },
    travelStyles[]->{
      titleI18n,
      "title": coalesce(titleI18n[$lang], title),
      "slug": slug.current
    }
  }
`;

export async function getGalleryItems(options?: { preview?: boolean; lang?: 'it' | 'en' }) {
  const sanityClient = options?.preview ? previewClient : client;

  return sanityClient.fetch<SanityGalleryItem[]>(
    GALLERY_QUERY,
    { preview: options?.preview ?? false, lang: options?.lang ?? 'it' },
    options?.preview
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 * 60 * 24 } }, // 24h
  );
}
