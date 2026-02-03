// src/sanity/queries/postBySlug.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

type MediaItem = {
  _id?: string;
  _type: 'mediaItem';
  type?: 'image' | 'video';
  title?: string;

  /** SEO alt (single string fallback) */
  alt?: string;

  /** Accessibility-only localized alt */
  altI18n?: { it?: string; en?: string };

  /** Localized caption */
  captionI18n?: { it?: string; en?: string };

  /** Resolved caption for requested language */
  captionResolved?: string;

  /** Resolved a11y alt for requested language (falls back to SEO alt) */
  altA11yResolved?: string;

  credit?: string;

  image?: SanityImageSource | null;
  videoUrl?: string;
};

type MediaReference = { _type: 'reference'; _ref: string };

// After GROQ deref, references become `mediaItem` objects.
// Keep `MediaReference` in the union as a safe fallback if deref ever fails.
type PortableTextValue = Array<PortableTextBlock | MediaItem | MediaReference>;

export type BlogPostBySlug = {
  _id: string;

  /** Raw bilingual fields from schema */
  titleIt: string;
  titleEn?: string;
  excerptIt?: string;
  excerptEn?: string;

  slug: string;
  publishedAt?: string;

  /** Optional English-only SEO object (per schema) */
  seo?: {
    title?: string;
    description?: string;
  };

  /** Dereferenced mediaItem (may be null if not set) */
  coverImage?: MediaItem | null;

  /** Raw content arrays (bilingual) */
  contentIt?: PortableTextValue;
  contentEn?: PortableTextValue;

  /** Resolved fields for requested language (with fallback) */
  title: string;
  excerpt?: string;
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

    titleIt,
    titleEn,
    excerptIt,
    excerptEn,

    "slug": slug.current,
    publishedAt,
    seo,

    "coverImage": coverImage-> {
      _id,
      _type,
      type,
      title,
      alt,
      altI18n,
      captionI18n,
      "captionResolved": select(
        $lang == "en" => coalesce(captionI18n.en, captionI18n.it),
        coalesce(captionI18n.it, captionI18n.en)
      ),
      "altA11yResolved": select(
        $lang == "en" => coalesce(altI18n.en, altI18n.it, alt),
        coalesce(altI18n.it, altI18n.en, alt)
      ),
      credit,
      image,
      videoUrl
    },

    // Expand references inside Portable Text (Italian)
    "contentIt": coalesce(contentIt, [])[]{
      ...,
      _type == "reference" => @-> {
        _id,
        _type,
        type,
        title,
        alt,
        altI18n,
        captionI18n,
        "captionResolved": coalesce(captionI18n.it, captionI18n.en),
        "altA11yResolved": coalesce(altI18n.it, altI18n.en, alt),
        credit,
        image,
        videoUrl
      }
    },

    // Expand references inside Portable Text (English)
    "contentEn": coalesce(contentEn, [])[]{
      ...,
      _type == "reference" => @-> {
        _id,
        _type,
        type,
        title,
        alt,
        altI18n,
        captionI18n,
        "captionResolved": coalesce(captionI18n.en, captionI18n.it),
        "altA11yResolved": coalesce(altI18n.en, altI18n.it, alt),
        credit,
        image,
        videoUrl
      }
    },

    // Resolved fields for requested language (fallback to the other language)
    "title": select(
      $lang == "en" => coalesce(titleEn, titleIt),
      coalesce(titleIt, titleEn)
    ),
    "excerpt": select(
      $lang == "en" => coalesce(excerptEn, excerptIt),
      coalesce(excerptIt, excerptEn)
    ),
    "content": coalesce(
      select(
        $lang == "en" => coalesce(contentEn, contentIt),
        coalesce(contentIt, contentEn)
      ),
      []
    )[]{
      ...,
      _type == "reference" => @-> {
        _id,
        _type,
        type,
        title,
        alt,
        altI18n,
        captionI18n,
        "captionResolved": select(
          $lang == "en" => coalesce(captionI18n.en, captionI18n.it),
          coalesce(captionI18n.it, captionI18n.en)
        ),
        "altA11yResolved": select(
          $lang == "en" => coalesce(altI18n.en, altI18n.it, alt),
          coalesce(altI18n.it, altI18n.en, alt)
        ),
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
