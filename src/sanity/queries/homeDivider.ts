// src/sanity/queries/homeDivider.ts
import { client } from '@/sanity/lib/client';
import type { PortableTextBlock } from '@portabletext/types';

export type HomeDividerData = {
  media?: {
    _id: string;
    title?: string;

    /** SEO alt (EN-only) */
    alt?: string;

    /** Accessibility-only localized alt */
    altI18n?: { it?: string; en?: string };

    /** Optional localized caption */
    captionI18n?: { it?: string; en?: string };

    /** Resolved title for requested language (uses captionI18n) */
    titleResolved?: string;

    /** Resolved fields for requested language */
    captionResolved?: string;
    altA11yResolved?: string;

    credit?: string;
    imageUrl?: string;
    orientation?: 'landscape' | 'portrait' | 'square' | 'panorama';
  } | null;

  /** Legacy overrides (kept for backward compatibility) */
  altOverride?: string | null;

  /** Optional bilingual eyebrow label shown above the divider title */
  eyebrow?: { it?: string; en?: string } | null;

  /** Optional bilingual rich text shown under the divider image */
  dividerContent?: { it?: PortableTextBlock[]; en?: PortableTextBlock[] } | null;

  link?: string | null;
} | null;

const HOME_DIVIDER_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "media": homeDivider.media->{
      _id,
      title,
      alt,
      altI18n,
      captionI18n,
      orientation,
      credit,
      "titleResolved": select(
        $lang == "en" => coalesce(captionI18n.en, captionI18n.it, title),
        coalesce(captionI18n.it, captionI18n.en, title)
      ),
      "captionResolved": select(
        $lang == "en" => coalesce(captionI18n.en, captionI18n.it),
        coalesce(captionI18n.it, captionI18n.en)
      ),
      "altA11yResolved": select(
        $lang == "en" => coalesce(altI18n.en, altI18n.it, alt),
        coalesce(altI18n.it, altI18n.en, alt)
      ),
      "imageUrl": image.asset->url
    },
    "altOverride": homeDivider.altOverride,
    "eyebrow": homeDivider.eyebrow,
    "dividerContent": homeDivider.dividerContent,
    "link": homeDivider.link
  }
`;

export async function getHomeDivider(
  lang: 'it' | 'en' = 'it',
): Promise<HomeDividerData> {
  const isDev = process.env.NODE_ENV === 'development';

  return client.fetch(
    HOME_DIVIDER_QUERY,
    { lang },
    isDev ? { cache: 'no-store' } : { next: { revalidate: 60 * 60 } },
  );
}
