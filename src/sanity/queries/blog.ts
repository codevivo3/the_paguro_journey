// src/sanity/queries/blog.ts
import { client } from '@/sanity/lib/client';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type BlogPostForIndex = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  coverImage?: SanityImageSource;
};

const BLOG_INDEX_QUERY = /* groq */ `
  *[_type=="post" && defined(slug.current) && !(_id in path("drafts.**"))] 
  | order(publishedAt desc,_createdAt desc) {
    _id, 
    title, 
    "slug": slug.current, 
    excerpt, 
    publishedAt,
    "coverImage": coverImage->image
  }
`;

export async function getBlogPostsForIndex() {
  return client.fetch<BlogPostForIndex[]>(
    BLOG_INDEX_QUERY,
    {},
    { next: { revalidate: 5 } },
  );
}
