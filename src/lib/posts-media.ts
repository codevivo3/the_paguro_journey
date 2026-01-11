// src/lib/posts-media.ts
import {
  getDefaultCoverForCountry,
  getDefaultGalleryForCountry,
} from '@/lib/gallery';
import type { Post } from '@/lib/posts';

const PLACEHOLDER = '/world-placeholder.png';

export function resolvePostCover(post: Post): string {
  return (
    post.coverImage ??
    getDefaultCoverForCountry(post.destination?.countrySlug) ??
    PLACEHOLDER
  );
}

export function resolvePostGallery(post: Post, limit = 6): string[] {
  // If post.gallery exists, use it (filter out empty)
  if (post.gallery?.length) return post.gallery.filter(Boolean);

  // Otherwise derive from destination gallery
  return getDefaultGalleryForCountry(post.destination?.countrySlug, limit);
}
