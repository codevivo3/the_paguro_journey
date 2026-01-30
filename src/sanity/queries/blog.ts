// src/sanity/queries/blog.ts
import { client } from '@/sanity/lib/client';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type BlogPostForIndex = {
  _id: string;

  /** Resolved fields for current language */
  title: string;
  excerpt?: string;

  /** Raw i18n objects (for future toggle or fallback use) */
  titleI18n?: { it?: string; en?: string };
  excerptI18n?: { it?: string; en?: string };

  slug: string;
  publishedAt?: string;
  coverImage?: SanityImageSource;
};

const BLOG_INDEX_QUERY = /* groq */ `
  *[_type == "post" && defined(slug.current) && !(_id in path("drafts.**"))]
  | order(publishedAt desc, _createdAt desc) {
    _id,

    titleI18n,
    excerptI18n,

    "title": coalesce(titleI18n[$lang], title),
    "excerpt": coalesce(excerptI18n[$lang], excerpt),

    "slug": slug.current,
    publishedAt,
    "coverImage": coverImage->image
  }
`;

export async function getBlogPostsForIndex(lang: 'it' | 'en' = 'it') {
  return client.fetch<BlogPostForIndex[]>(
    BLOG_INDEX_QUERY,
    { lang },
    { next: { revalidate: 5 } },
  );
}
