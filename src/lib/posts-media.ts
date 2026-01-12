import {
  getDefaultCoverForCountry,
  getDefaultGalleryForCountry,
  getGalleryImagesByCountry,
} from '@/lib/gallery';
import type { Post } from '@/lib/posts';

const PLACEHOLDER = '/world-placeholder.png';

export type ResolvedImage = {
  src: string;
  alt?: string;
  orientation?: 'portrait' | 'landscape';
};

/**
 * normalizeImageSrc
 *
 * Temporary compatibility layer.
 * Normalizes legacy paths like:
 *   /destinations/<country>/<file>.jpg
 * → /destinations/images/<country>/<file>.jpg
 */
function normalizeImageSrc(src?: string): string | undefined {
  if (!src) return undefined;

  // Already correct
  if (src.startsWith('/destinations/images/')) return src;

  // Legacy pattern: /destinations/<slug>/<file>
  const match = src.match(/^\/destinations\/([^/]+)\/(.+)$/);
  if (match) {
    const [, countrySlug, filename] = match;
    return `/destinations/images/${countrySlug}/${filename}`;
  }

  return src;
}

/**
 * Try to find orientation/alt for a src from gallery.ts
 * (works best when the src belongs to the same destination countrySlug)
 */
function findImageMeta(
  src: string,
  countrySlug?: string
): Omit<ResolvedImage, 'src'> {
  if (!countrySlug) return {};

  const imgs = getGalleryImagesByCountry(countrySlug);
  const hit = imgs.find((i) => i.src === src);

  if (!hit) return {};
  return { alt: hit.alt, orientation: hit.orientation };
}

/**
 * resolvePostCover (string)
 * Backwards compatible: returns only the src string.
 */
export function resolvePostCover(post: Post): string {
  return (
    normalizeImageSrc(post.coverImage) ??
    getDefaultCoverForCountry(post.destination?.countrySlug) ??
    PLACEHOLDER
  );
}

/**
 * resolvePostCoverImage (object)
 * New: returns src + (optional) alt/orientation from gallery.ts
 */
export function resolvePostCoverImage(post: Post): ResolvedImage {
  const src = resolvePostCover(post);
  const meta = findImageMeta(src, post.destination?.countrySlug);
  return { src, ...meta };
}

export function resolvePostGallery(post: Post, limit = 6): string[] {
  // 1) Explicit gallery → normalize every entry
  if (post.gallery?.length) {
    return post.gallery
      .map((src) => normalizeImageSrc(src))
      .filter(Boolean)
      .slice(0, limit) as string[];
  }

  // 2) Fallback: derive from destination gallery (already normalized)
  return getDefaultGalleryForCountry(post.destination?.countrySlug, limit);
}
