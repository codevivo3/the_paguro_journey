// src/sanity/queries/postBySlug.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

type MediaItem = {
  _id?: string;
  _type: 'mediaItem';
  type?: 'image' | 'video';
  title?: string;

  /** SEO alt (EN-only) */
  alt?: string;

  /** Accessibility-only localized alt */
  altI18n?: { it?: string; en?: string };

  /** Optional caption (legacy single string) */
  caption?: string;

  /** Optional localized caption */
  captionI18n?: { it?: string; en?: string };

  /** Resolved caption for requested language */
  captionResolved?: string;

  /** Resolved a11y alt for requested language (falls back to SEO alt) */
  altA11yResolved?: string;

  image?: SanityImageSource | null;
  videoUrl?: string;
};

type MediaReference = { _type: 'reference'; _ref: string };

// After GROQ deref, references become `mediaItem` objects.
// Keep `MediaReference` in the union as a safe fallback if deref ever fails.
type PortableTextValue = Array<PortableTextBlock | MediaItem | MediaReference>;

export type BlogPostBySlug = {
  _id: string;

  /** Resolved fields for requested language */
  title: string;
  excerpt?: string;

  /** Raw i18n objects (optional, for future toggle use) */
  titleI18n?: { it?: string; en?: string };
  excerptI18n?: { it?: string; en?: string };

  slug: string;
  publishedAt?: string;
  coverImage?: SanityImageSource | null;
  content: PortableTextValue;
};

const POST_BY_SLUG_QUERY = /* groq */ `
  *[
    _type == "post" &&
    (
      $preview == true ||
      !defined(status) ||
      status == "published"
    ) &&
    slug.current == $slug
  ][0]{
    _id,
    titleI18n,
    excerptI18n,

    "title": coalesce(titleI18n[$lang], title),
    "excerpt": coalesce(excerptI18n[$lang], excerpt),
    "slug": slug.current,
    publishedAt,
    "coverImage": coverImage->image,

    // ✅ Expand references inside Portable Text
    "content": content[]{
      ...,
      _type == "reference" => @->{
        _id,
        _type,
        type,
        title,
        alt,
        altI18n,
        caption,
        captionI18n,
        "captionResolved": coalesce(captionI18n[$lang], caption),
        "altA11yResolved": coalesce(altI18n[$lang], alt),
        credit,
        image,
        videoUrl
      }
    }
  }
`;

function isAbortError(err: unknown) {
  if (!err || typeof err !== 'object') return false;
  const anyErr = err as { name?: string; code?: string; message?: string };
  return (
    anyErr.name === 'AbortError' ||
    anyErr.code === 'UND_ERR_ABORTED' ||
    (typeof anyErr.message === 'string' &&
      anyErr.message.toLowerCase().includes('signal is aborted'))
  );
}

export async function getPostBySlug(
  slug: string,
  options?: { preview?: boolean; lang?: 'it' | 'en' },
) {
  const sanityClient = options?.preview ? previewClient : client;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    return await sanityClient.fetch<BlogPostBySlug | null>(
      POST_BY_SLUG_QUERY,
      { slug, preview: options?.preview ?? false, lang: options?.lang ?? 'it' },
      // In dev we prefer fresh data and avoid weird abort/caching edge cases.
      isDev || options?.preview
        ? { cache: 'no-store' }
        : { next: { revalidate: 60 * 60 } },
    );
  } catch (err) {
    // Next.js can abort in-flight fetches during navigation / HMR.
    // Treat AbortError as a benign cancellation.
    if ((isDev || options?.preview) && isAbortError(err)) {
      return null;
    }
    throw err;
  }
}
