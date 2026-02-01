import type { PortableTextBlock } from '@portabletext/types';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import type { Lang } from '@/lib/route';
import { client } from '@/sanity/lib/client';

export type AboutSettings = {
  title?: { it?: string; en?: string } | null;
  subtitle?: { it?: string; en?: string } | null;
  content?: { it?: PortableTextBlock[]; en?: PortableTextBlock[] } | null;
  image?: {
    alt?: string;
    altI18n?: { it?: string; en?: string } | null;
    captionResolved?: string | null;
    altA11yResolved?: string | null;
    image?: SanityImageSource | null;
    blurDataURL?: string;
  } | null;
} | null;

export type AboutImage = NonNullable<AboutSettings>['image'] | null;

export const ABOUT_SETTINGS_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "about": {
      "title": aboutTitle,
      "subtitle": aboutSubtitle,
      "content": aboutContent,
      "image": aboutImage-> {
        alt,
        altI18n,
        "captionResolved": select(
          $lang == "en" => coalesce(captionI18n.en, captionI18n.it),
          coalesce(captionI18n.it, captionI18n.en)
        ),
        "altA11yResolved": select(
          $lang == "en" => coalesce(altI18n.en, altI18n.it, alt),
          coalesce(altI18n.it, altI18n.en, alt)
        ),
        "image": image.asset,
        "blurDataURL": image.asset->metadata.lqip
      }
    }
  }
`;

export async function getAboutSettings(
  lang: Lang,
  options?: { revalidate?: number },
): Promise<AboutSettings> {
  const data = await client.fetch<{ about?: AboutSettings } | null>(
    ABOUT_SETTINGS_QUERY,
    { lang },
    { next: { revalidate: options?.revalidate ?? 60 } },
  );
  return data?.about ?? null;
}

export async function getAboutImage(
  lang: Lang,
  options?: { revalidate?: number },
): Promise<AboutImage> {
  const about = await getAboutSettings(lang, options);
  return about?.image ?? null;
}
