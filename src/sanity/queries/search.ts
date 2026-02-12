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

      // --- Excerpts ---
      excerpt match $pattern ||
      excerptIt match $pattern ||
      excerptEn match $pattern ||

      // --- Country labels / taxonomy ---
      // destination.country (single ref) and post.countries (array)
      country->title match $pattern ||
      country->nameI18n.en match $pattern ||
      country->nameI18n.it match $pattern ||

      countries[]->title match $pattern ||
      countries[]->nameI18n.en match $pattern ||
      countries[]->nameI18n.it match $pattern ||

      // --- Cover media text (coverImage is a mediaItem reference in BOTH post + destination) ---
      coverImage->title match $pattern ||
      coverImage->alt match $pattern ||
      coverImage->altI18n.en match $pattern ||
      coverImage->altI18n.it match $pattern ||
      coverImage->captionI18n.en match $pattern ||
      coverImage->captionI18n.it match $pattern ||

      coverImage->countries[]->title match $pattern ||
      coverImage->countries[]->nameI18n.en match $pattern ||
      coverImage->countries[]->nameI18n.it match $pattern ||

      // --- Cover image caption fallback (if caption lives on the image field) ---
      coverImage.caption match $pattern ||

      // --- Portable text content (FULL mode only) ---
      (
        $mode == "full" &&
        (
          // Search portable-text body.
          // Prefer current language, but fall back to the other language if missing.
          pt::text(
            select(
              $lang == "en" => coalesce(contentEn, contentIt),
              coalesce(contentIt, contentEn)
            )
          ) match $pattern ||

          // Legacy single-field fallback
          pt::text(content) match $pattern
        )
      )
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

      // --- Excerpts ---
      excerpt match $pattern ||
      excerptIt match $pattern ||
      excerptEn match $pattern ||

      // --- Country labels / taxonomy ---
      // destination.country (single ref) and post.countries (array)
      country->title match $pattern ||
      country->nameI18n.en match $pattern ||
      country->nameI18n.it match $pattern ||

      countries[]->title match $pattern ||
      countries[]->nameI18n.en match $pattern ||
      countries[]->nameI18n.it match $pattern ||

      // --- Cover media text (coverImage is a mediaItem reference in BOTH post + destination) ---
      coverImage->title match $pattern ||
      coverImage->alt match $pattern ||
      coverImage->altI18n.en match $pattern ||
      coverImage->altI18n.it match $pattern ||
      coverImage->captionI18n.en match $pattern ||
      coverImage->captionI18n.it match $pattern ||

      coverImage->countries[]->title match $pattern ||
      coverImage->countries[]->nameI18n.en match $pattern ||
      coverImage->countries[]->nameI18n.it match $pattern ||

      // --- Cover image caption fallback (if caption lives on the image field) ---
      coverImage.caption match $pattern ||

      // --- Portable text content (FULL mode only) ---
      (
        $mode == "full" &&
        (
          // Search portable-text body.
          // Prefer current language, but fall back to the other language if missing.
          pt::text(
            select(
              $lang == "en" => coalesce(contentEn, contentIt),
              coalesce(contentIt, contentEn)
            )
          ) match $pattern ||

          // Legacy single-field fallback
          pt::text(content) match $pattern
        )
      )
    ) &&
    (
      $preview == true ||
      !defined(status) ||
      status == "published"
    )
  ]
  | order(publishedAt desc, _createdAt desc)
  [$start...$end]{
    _id,
    _type,

    // Raw bilingual fields (so UI can use pickLang if desired)
    "titleIt": titleIt,
    "titleEn": titleEn,
    "excerptIt": excerptIt,
    "excerptEn": excerptEn,

    // Resolved fields (API default)
    "title": coalesce(
      select(
        $lang == "en" => coalesce(titleEn, titleIt, title),
        coalesce(titleIt, titleEn, title)
      ),
      title
    ),
    "excerpt": coalesce(
      select(
        $lang == "en" => coalesce(excerptEn, excerptIt, excerpt),
        coalesce(excerptIt, excerptEn, excerpt)
      ),
      excerpt
    ),

    "slug": slug.current,

    // Cover image
    // In your schemas, coverImage is a reference to mediaItem.
    // Keep a couple of fallbacks for legacy/other doc types.
    "coverImage": coalesce(
      coverImage->image,
      coverImage.image,
      coverImage
    ),
    "coverImageUrl": coalesce(
      // Normal case: coverImage is a mediaItem reference
      coverImage->image.asset->url,
      // Fallback: coverImage has nested image
      coverImage.image.asset->url,
      // Fallback: coverImage is a direct image field
      coverImage.asset->url
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
  /**
   * quick: titles/excerpts/taxonomy/media only (best for SearchModal)
   * full: also searches portable-text body (best for the /search page)
   */
  mode?: 'quick' | 'full';
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
      mode: args.mode ?? 'quick',
    },
    {
      // Search is query-driven and highly dynamic (q, page, mode).
      // Keep uncached to avoid stale results and inconsistent pagination.
      // This is intentionally independent from Option 4 (on-demand revalidation).
      cache: 'no-store',
    },
  );

  const total = data?.total ?? 0;
  return {
    items: data?.items ?? [],
    total,
    page,
    pages: Math.ceil(total / limit),
  };
}
