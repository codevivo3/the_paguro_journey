// src/sanity/queries/search.ts
import { client } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type SearchItem = {
  _id: string;
  _type: 'post' | 'destination';

  /** Resolved fields for requested language */
  title: string;
  excerpt?: string;

  /** Raw bilingual fields (optional, for UI-level pickLang / debugging) */
  titleIt?: string | null;
  titleEn?: string | null;
  excerptIt?: string | null;
  excerptEn?: string | null;

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
      // --- Titles ---
      title match $pattern ||
      titleIt match $pattern ||
      titleEn match $pattern ||
      titleI18n.it match $pattern ||
      titleI18n.en match $pattern ||

      // --- Excerpts ---
      excerpt match $pattern ||
      excerptIt match $pattern ||
      excerptEn match $pattern ||
      excerptI18n.it match $pattern ||
      excerptI18n.en match $pattern ||

      // --- Portable text content (both langs + legacy fallback) ---
      pt::text(contentIt) match $pattern ||
      pt::text(contentEn) match $pattern ||
      pt::text(content) match $pattern
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
      // --- Titles ---
      title match $pattern ||
      titleIt match $pattern ||
      titleEn match $pattern ||
      titleI18n.it match $pattern ||
      titleI18n.en match $pattern ||

      // --- Excerpts ---
      excerpt match $pattern ||
      excerptIt match $pattern ||
      excerptEn match $pattern ||
      excerptI18n.it match $pattern ||
      excerptI18n.en match $pattern ||

      // --- Portable text content (both langs + legacy fallback) ---
      pt::text(contentIt) match $pattern ||
      pt::text(contentEn) match $pattern ||
      pt::text(content) match $pattern
    ) &&
    (
      $preview == true ||
      !defined(status) ||
      status == "published"
    )
  ]
  | score(
      // Prefer title hits, then excerpt, then body.
      titleIt match $pattern,
      titleEn match $pattern,
      titleI18n.it match $pattern,
      titleI18n.en match $pattern,
      title match $pattern,

      excerptIt match $pattern,
      excerptEn match $pattern,
      excerptI18n.it match $pattern,
      excerptI18n.en match $pattern,
      excerpt match $pattern,

      pt::text(contentIt) match $pattern,
      pt::text(contentEn) match $pattern,
      pt::text(content) match $pattern
    )
  | order(_score desc, publishedAt desc)
  [$start...$end]{
    _id,
    _type,

    // Raw bilingual fields (so UI can use pickLang if desired)
    "titleIt": coalesce(titleIt, titleI18n.it),
    "titleEn": coalesce(titleEn, titleI18n.en),
    "excerptIt": coalesce(excerptIt, excerptI18n.it),
    "excerptEn": coalesce(excerptEn, excerptI18n.en),

    // Resolved fields (API default)
    "title": coalesce(
      select(
        $lang == "en" => coalesce(titleEn, titleI18n.en),
        coalesce(titleIt, titleI18n.it)
      ),
      title
    ),
    "excerpt": coalesce(
      select(
        $lang == "en" => coalesce(excerptEn, excerptI18n.en),
        coalesce(excerptIt, excerptI18n.it)
      ),
      excerpt
    ),

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
