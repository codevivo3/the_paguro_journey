import type { SanityDocument } from 'sanity';

export function resolvePreviewUrl(doc: SanityDocument) {
  const slug = (doc as { slug?: { current?: string } })?.slug?.current;

  if (!slug) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return `${baseUrl}/api/draft?secret=${process.env.SANITY_PREVIEW_SECRET}&slug=${slug}`;
}
