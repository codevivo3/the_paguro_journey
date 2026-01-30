// src/sanity/queries/search.ts
import { client } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type SearchItem = {
  _id: string;
  _type: 'post' | 'destination';

  /** Resolved fields for requested language */
  title: string;
  excerpt?: string;

  /** Raw i18n objects (optional, for future toggle use) */
  titleI18n?: { it?: string; en?: string };
  excerptI18n?: { it?: string; en?: string };

  slug?: string;
  coverImage?: SanityImageSource | null;
  coverImageUrl?: string | null;
};

export type SearchResult = {
  items: SearchItem[];
  total: number;
  page: number;
  pages: number;
};

const SEARCH_QUERY = /* groq */ `
{
  "total": count(*[
    _type in $types &&
    (
      title match $pattern ||
      titleI18n.it match $pattern ||
      titleI18n.en match $pattern ||
      pt::text(content) match $pattern ||
      excerpt match $pattern ||
      excerptI18n.it match $pattern ||
      excerptI18n.en match $pattern
    ) &&
    (
      $preview == true ||
      !defined(status) ||
      status == "published"
    )
  ]),

  "items": *[
    _type in $types &&
    (
      title match $pattern ||
      titleI18n.it match $pattern ||
      titleI18n.en match $pattern ||
      pt::text(content) match $pattern ||
      excerpt match $pattern ||
      excerptI18n.it match $pattern ||
      excerptI18n.en match $pattern
    ) &&
    (
      $preview == true ||
      !defined(status) ||
      status == "published"
    )
  ]
  | score(
      title match $pattern,
      titleI18n.it match $pattern,
      titleI18n.en match $pattern,
      excerpt match $pattern,
      excerptI18n.it match $pattern,
      excerptI18n.en match $pattern,
      pt::text(content) match $pattern
    )
  | order(_score desc, publishedAt desc)
  [$start...$end]{
    _id,
    _type,

    titleI18n,
    excerptI18n,

    "title": coalesce(titleI18n[$lang], title),
    "excerpt": coalesce(excerptI18n[$lang], excerpt),

    "slug": slug.current,

    // Cover image (supports direct image fields OR mediaItem references)
    "coverImage": coalesce(
      coverImage,
      coverImage->image,
      coverImage.image
    ),
    "coverImageUrl": coalesce(
      coverImage.asset->url,
      coverImage.image.asset->url,
      coverImage->image.asset->url
    )
  }
}
`;

function normalizeQuery(q: string) {
  const trimmed = q.trim();
  if (!trimmed) return '';
  // GROQ match uses wildcard. We’ll search “contains” style:
  // "foo bar" -> "*foo*bar*"
  return `*${trimmed.split(/\s+/).join('*')}*`;
}

export async function searchContent(args: {
  q: string;
  page?: number;
  limit?: number;
  types?: Array<'post' | 'destination'>;
  preview?: boolean;
  lang?: 'it' | 'en';
}): Promise<SearchResult> {
  const page = Math.max(1, args.page ?? 1);
  const limit = Math.min(24, Math.max(6, args.limit ?? 12));
  const start = (page - 1) * limit;
  const end = start + limit;

  const pattern = normalizeQuery(args.q);
  if (!pattern) return { items: [], total: 0, page, pages: 0 };

  const data = await client.fetch(
    SEARCH_QUERY,
    {
      pattern,
      start,
      end,
      types: args.types ?? ['post', 'destination'],
      preview: args.preview ?? false,
      lang: args.lang ?? 'it',
    },
    { cache: 'no-store' }, // dev-friendly; later you can revalidate
  );

  const total = data?.total ?? 0;
  return {
    items: data?.items ?? [],
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
