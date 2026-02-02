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
    "desktop": coalesce(homeHeroSlides[]-> {
      _id,
      alt,
      altI18n,
      titleI18n,
      captionI18n,
      "titleResolved": coalesce(titleI18n[$lang], titleI18n.it, titleI18n.en, title),
      "captionResolved": coalesce(captionI18n[$lang], captionI18n.it, captionI18n.en),
      "altA11yResolved": coalesce(altI18n[$lang], altI18n.it, altI18n.en, alt),
      image,
      "blurDataURL": image.asset->metadata.lqip
    }, []),

    "mobile": coalesce(homeHeroSlidesMobile[]-> {
      _id,
      alt,
      altI18n,
      titleI18n,
      captionI18n,
      "titleResolved": coalesce(titleI18n[$lang], titleI18n.it, titleI18n.en, title),
      "captionResolved": coalesce(captionI18n[$lang], captionI18n.it, captionI18n.en),
      "altA11yResolved": coalesce(altI18n[$lang], altI18n.it, altI18n.en, alt),
      image,
      "blurDataURL": image.asset->metadata.lqip
    }, [])
  }
`;

export async function getHomeHeroSlides(lang: 'it' | 'en' = 'it') {
  const res = await client.fetch<{
    desktop?: SanityHomeHeroSlide[];
    mobile?: SanityHomeHeroSlide[];
  }>(HOME_HERO_SLIDES_QUERY, { lang }, { next: { revalidate: 60 * 60 } });

  const desktop = res?.desktop ?? [];
  const mobile = res?.mobile ?? [];

  return {
    desktop,
    mobile: mobile.length > 0 ? mobile : desktop,
  };
}
