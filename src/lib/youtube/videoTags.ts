

/**
 * videoTags.ts
 *
 * Phase 1 (post-launch): Destinations are video-first.
 * We manually map YouTube video IDs to a destination taxonomy
 * (country + region) so we can build a Destinations grid immediately,
 * without waiting for blog content.
 *
 * IMPORTANT:
 * - Only videos listed here will appear on the Destinations page.
 * - This avoids burning YouTube quota with complex searches.
 * - Later we can migrate this mapping into Sanity (videoItem docs) with minimal UI changes.
 */

export type VideoGeoTag = {
  /** Destination country slug (must match your destinations dataset) */
  countrySlug: string;
  /** Region/continent slug (must match your regions dataset) */
  regionSlug: string;
};

/**
 * Manual mapping: youtubeId -> geo tag
 *
 * Example:
 *   'dQw4w9WgXcQ': { countrySlug: 'thailand', regionSlug: 'asia' },
 */
export const videoTags: Record<string, VideoGeoTag> = {
  // Thailand
  // 'xxxxxxxxxxx': { countrySlug: 'thailand', regionSlug: 'asia' },

  // Japan
  // 'yyyyyyyyyyy': { countrySlug: 'japan', regionSlug: 'asia' },

  // Greece
  // 'zzzzzzzzzzz': { countrySlug: 'greece', regionSlug: 'europe' },
};

/** Convenience: how many videos are currently tagged. */
export const taggedVideoCount = Object.keys(videoTags).length;