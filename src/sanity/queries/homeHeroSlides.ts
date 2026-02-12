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

  image?: SanityImage;
  blurDataURL?: string;
};

type SanityImage = {
  asset?: {
    _ref?: string;
    _id?: string;
  };
};

const HOME_HERO_SLIDES_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "desktop": coalesce(
      (homeHeroSlides[]-> {
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
      })[defined(image.asset)],
      []
    ),

    "mobile": coalesce(
      (homeHeroSlidesMobile[]-> {
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
      })[defined(image.asset)],
      []
    )
  }
`;

export async function getHomeHeroSlides(lang: 'it' | 'en' = 'it') {
  const isDev = process.env.NODE_ENV === 'development';

  const res = await client.fetch<{
    desktop?: SanityHomeHeroSlide[];
    mobile?: SanityHomeHeroSlide[];
  }>(
    HOME_HERO_SLIDES_QUERY,
    { lang },
    isDev
      ? ({ cache: 'no-store' } as const)
      : {
          // Production: cache indefinitely and refresh via on-demand revalidation (Option 4)
          // when Sanity content changes.
          next: { tags: ['sanity', 'homeHeroSlides', 'siteSettings'] },
        },
  );

  const hasImageAsset = (slide: SanityHomeHeroSlide | null | undefined) => {
    return Boolean(slide?._id) && Boolean(slide?.image?.asset);
  };

  const desktop = (res?.desktop ?? []).filter(hasImageAsset);
  const mobile = (res?.mobile ?? []).filter(hasImageAsset);

  return {
    desktop,
    mobile: mobile.length > 0 ? mobile : desktop,
  };
}
