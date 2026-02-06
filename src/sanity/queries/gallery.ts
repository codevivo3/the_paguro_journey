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

  /** Optional localized caption */
  captionI18n?: { it?: string; en?: string };

  /** Optional plain caption (non-localized) */
  caption?: string;

  /** Resolved fields for requested language */
  captionResolved?: string;
  altA11yResolved?: string;

  /**
   * Final orientation the frontend should use (effective).
   * - If `lockOrientation` is true, this is derived from asset dimensions.
   * - Otherwise it matches the editor-chosen value.
   */
  orientation?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /** Editor-chosen/manual orientation (kept for debugging & Studio intent). */
  orientationEditor?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /** If true, the gallery should NOT remap this image into other aspect ratios */
  lockOrientation?: boolean;

  /**
   * Original orientation derived from the image asset dimensions.
   * Use this when `lockOrientation` is true to avoid relying on manual `orientation`.
   */
  originalOrientation?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /**
   * Final orientation the frontend should use.
   * If `lockOrientation` is true, this equals `originalOrientation`.
   * Otherwise it equals the editor-chosen `orientation`.
   */
  orientationEffective?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /** Asset dimensions (for debugging / future layout logic) */
  dimensions?: { width?: number; height?: number; aspectRatio?: number } | null;

  /** Sanity image field (matches `mediaItem.image`) */
  image: SanityImageSource;

  /** Optional focal point helpers (derived from `image`) */
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  } | null;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null;

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
    captionI18n,
    caption,

    // Resolved i18n helpers
    "captionResolved": coalesce(captionI18n[$lang], captionI18n.it, captionI18n.en, caption),
    "altA11yResolved": coalesce(altI18n[$lang], altI18n.it, altI18n.en, alt),

    // Preserve the editor-chosen value (manual orientation dropdown)
    "orientationEditor": orientation,

    "lockOrientation": coalesce(lockOrientation, false),

    "dimensions": image.asset->metadata.dimensions,

    // Derive a stable, data-driven orientation from asset dimensions.
    // Thresholds are opinionated but practical:
    // - panorama: very wide images
    // - square: near 1:1
    // - landscape/portrait: everything else
    "originalOrientation": select(
      defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 2.0 => "panorama",
      defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 0.9 && image.asset->metadata.dimensions.aspectRatio <= 1.1 => "square",
      defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio > 1.1 => "landscape",
      defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio < 0.9 => "portrait",
      // Fallback if no metadata
      orientation
    ),

    // Final orientation the frontend should use.
    // If the item is locked, force the data-driven original orientation.
    // Otherwise, allow the editor-chosen orientation to drive the masonry rhythm.
    "orientationEffective": select(
      coalesce(lockOrientation, false) == true => select(
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 2.0 => "panorama",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 0.9 && image.asset->metadata.dimensions.aspectRatio <= 1.1 => "square",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio > 1.1 => "landscape",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio < 0.9 => "portrait",
        // Fallback if no metadata
        orientation
      ),
      orientation
    ),

    // Backward-compatible alias: many components read "orientation".
    // We ensure it always reflects the effective value (locked or manual).
    "orientation": select(
      coalesce(lockOrientation, false) == true => select(
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 2.0 => "panorama",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio >= 0.9 && image.asset->metadata.dimensions.aspectRatio <= 1.1 => "square",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio > 1.1 => "landscape",
        defined(image.asset->metadata.dimensions.aspectRatio) && image.asset->metadata.dimensions.aspectRatio < 0.9 => "portrait",
        // Fallback if no metadata
        orientation
      ),
      orientation
    ),

    // Keep a stable key name for the frontend mapper
    "image": image,
    "hotspot": image.hotspot,
    "crop": image.crop,

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
