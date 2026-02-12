

// src/sanity/queries/homeIntro.ts
import { client } from '@/sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';

export type HomeIntroData = {
  /** Resolved hero headline for current language */
  headlineResolved?: string | null;

  /** Raw i18n headline (handy for future UI toggle) */
  headlineI18n?: { it?: string | null; en?: string | null } | null;

  /** Resolved intro rich text for current language */
  introResolved?: PortableTextBlock[] | null;

  /** Raw i18n intro (handy for future UI toggle) */
  introI18n?: { it?: PortableTextBlock[] | null; en?: PortableTextBlock[] | null } | null;
} | null;

const HOME_INTRO_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    // --- Headline ---
    "headlineI18n": homeHeroHeadline,
    "headlineResolved": coalesce(homeHeroHeadline[$lang], homeHeroHeadline.it, homeHeroHeadline.en),

    // --- Intro body (Portable Text) ---
    "introI18n": homeIntro,
    "introResolved": coalesce(homeIntro[$lang], homeIntro.it, homeIntro.en)
  }
`;

export async function getHomeIntro(lang: 'it' | 'en' = 'it'): Promise<HomeIntroData> {
  const isDev = process.env.NODE_ENV === 'development';

  return client.fetch<HomeIntroData>(
    HOME_INTRO_QUERY,
    { lang },
    isDev
      ? { cache: 'no-store' }
      : {
          // Production: cache indefinitely and refresh via on-demand revalidation (Option 4)
          // when Sanity content (siteSettings/homeIntro) changes.
          next: { tags: ['sanity', 'homeIntro', 'siteSettings'] },
        },
  );
}