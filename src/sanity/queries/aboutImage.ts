import { client } from '@/sanity/lib/client';

export type SanityAboutImage = {
  _id: string;
  title?: string;

  /** SEO alt (EN-only) */
  alt?: string;

  /** Accessibility-only localized alt */
  altI18n?: { it?: string; en?: string };

  /** Optional caption (legacy single string) */
  caption?: string;

  /** Optional localized caption */
  captionI18n?: { it?: string; en?: string };

  /** Resolved caption for the requested language (falls back safely) */
  captionResolved?: string;

  /** Resolved a11y alt for the requested language (falls back to SEO alt) */
  altA11yResolved?: string;

  image?: unknown; // Sanity image field
};

const ABOUT_IMAGE_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    aboutImage->{
      _id,
      title,
      alt,
      altI18n,
      caption,
      captionI18n,
      "captionResolved": coalesce(captionI18n[$lang], caption),
      "altA11yResolved": coalesce(altI18n[$lang], alt),
      image
    }
  }
`;

export async function getAboutImage(lang: 'it' | 'en' = 'it') {
  const res = await client.fetch<{ aboutImage?: SanityAboutImage | null }>(
    ABOUT_IMAGE_QUERY,
    { lang },
    { next: { revalidate: 60 * 60 } },
  );

  return res?.aboutImage ?? null;
}
