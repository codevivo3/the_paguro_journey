// src/sanity/queries/homeHeroSlides.ts
import { client } from '@/sanity/lib/client';

export type SanityHomeHeroSlide = {
  _id: string;

  /** SEO alt (EN-only) */
  alt?: string;

  /** Accessibility-only localized alt */
  altI18n?: { it?: string; en?: string };

  /** Optional localized caption/title */
  titleI18n?: { it?: string; en?: string };
  captionI18n?: { it?: string; en?: string };

  /** Resolved fields for requested language */
  titleResolved?: string;
  captionResolved?: string;
  altA11yResolved?: string;

  image: unknown;
  blurDataURL?: string;
};

const HOME_HERO_SLIDES_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "desktop": *[
      _type == "mediaItem" && (hero.enabled == true || heroEnabled == true) && hero.desktopEligible == true
    ] | order(coalesce(hero.desktopRank, heroRank, 9999) asc) {
      _id,
      alt,
      altI18n,
      titleI18n,
      captionI18n,
      "titleResolved": coalesce(titleI18n[$lang], title),
      "captionResolved": coalesce(captionI18n[$lang], caption),
      "altA11yResolved": coalesce(altI18n[$lang], alt),
      image,
      "blurDataURL": image.asset->metadata.lqip
    },

    "mobile": *[
      _type == "mediaItem" && (hero.enabled == true || heroEnabled == true) && hero.mobileEligible == true
    ] | order(coalesce(hero.mobileRank, heroRank, 9999) asc) {
      _id,
      alt,
      altI18n,
      titleI18n,
      captionI18n,
      "titleResolved": coalesce(titleI18n[$lang], title),
      "captionResolved": coalesce(captionI18n[$lang], caption),
      "altA11yResolved": coalesce(altI18n[$lang], alt),
      image,
      "blurDataURL": image.asset->metadata.lqip
    }
  }
`;

export async function getHomeHeroSlides(lang: 'it' | 'en' = 'it') {
  const res = await client.fetch<{
    desktop?: SanityHomeHeroSlide[];
    mobile?: SanityHomeHeroSlide[];
  }>(HOME_HERO_SLIDES_QUERY, { lang }, { next: { revalidate: 60 * 60 } });

  return {
    desktop: res?.desktop ?? [],
    mobile: res?.mobile ?? [],
  };
}
