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
    (status == "published" || $preview == true) &&
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

export async function getPostBySlug(
  slug: string,
  options?: { preview?: boolean },
) {
  const sanityClient = options?.preview ? previewClient : client;

  return sanityClient.fetch<BlogPostBySlug | null>(
    POST_BY_SLUG_QUERY,
    { slug, preview: options?.preview ?? false },
    options?.preview
      ? { cache: 'no-store' }
      : { next: { revalidate: 60 * 60 } },
  );
}
