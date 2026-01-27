// src/sanity/queries/postBySlug.ts
import { client, previewClient } from '@/sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

type MediaItem = {
  _id?: string;
  _type: 'mediaItem';
  type?: 'image' | 'video';
  title?: string;
  alt?: string;
  caption?: string;
  image?: SanityImageSource | null;
  videoUrl?: string;
};

type MediaReference = { _type: 'reference'; _ref: string };

// After GROQ deref, references become `mediaItem` objects.
// Keep `MediaReference` in the union as a safe fallback if deref ever fails.
type PortableTextValue = Array<PortableTextBlock | MediaItem | MediaReference>;

export type BlogPostBySlug = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
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
    title,
    "slug": slug.current,
    excerpt,
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
        caption,
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
  options?: { preview?: boolean },
) {
  const sanityClient = options?.preview ? previewClient : client;
  const isDev = process.env.NODE_ENV === 'development';

  try {
    return await sanityClient.fetch<BlogPostBySlug | null>(
      POST_BY_SLUG_QUERY,
      { slug, preview: options?.preview ?? false },
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
