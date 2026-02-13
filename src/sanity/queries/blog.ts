// src/sanity/queries/blog.ts
import { client } from '@/sanity/lib/client';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type BlogPostForIndex = {
  _id: string;

  /** Resolved fields for current language */
  title: string;
  excerpt?: string;

  /** Explicit EN/IT fields for blog cards */
  titleIt?: string | null;
  titleEn?: string | null;
  excerptIt?: string | null;
  excerptEn?: string | null;

  slug: string;
  publishedAt?: string;
  sortDate?: string;
  coverImage?: SanityImageSource;
};

const BLOG_INDEX_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(coalesce(publishedAt, _updatedAt, _createdAt) desc) {
    _id,

    titleIt,
    titleEn,
    excerptIt,
    excerptEn,

    "title": select(
      $lang == "en" => coalesce(titleEn, titleIt),
      coalesce(titleIt, titleEn)
    ),
    "excerpt": select(
      $lang == "en" => coalesce(excerptEn, excerptIt),
      coalesce(excerptIt, excerptEn)
    ),

    "slug": slug.current,
    publishedAt,
    "sortDate": coalesce(publishedAt, _updatedAt, _createdAt),

    // Support coverImage as a mediaItem ref (coverImage->image),
    // an inline object (coverImage.image), or a direct image field (coverImage)
    "coverImage": coalesce(coverImage->image, coverImage.image, coverImage)
  }
`;

export async function getBlogPostsForIndex(lang: 'it' | 'en' = 'it') {
  return client.fetch<BlogPostForIndex[]>(
    BLOG_INDEX_QUERY,
    { lang },
    { next: { revalidate: 5, tags: ['sanity', 'post'] } },
  );
}
