import { client } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type CountryCard = {
  _id: string;

  /** Resolved title for the requested language */
  title: string;

  /** Raw i18n titles (optional, for future toggle use) */
  titleI18n?: { it?: string; en?: string };

  slug: string;
  postCount: number;
  coverImage?: SanityImageSource | null;
};

const COUNTRIES_WITH_POSTS_QUERY = /* groq */ `
  *[
    _type == "country" &&
    count(*[
      _type == "post" &&
      status == "published" &&
      references(^._id)
    ]) > 0
  ] | order(coalesce(titleI18n[$lang], title) asc) {
    _id,

    titleI18n,
    "title": coalesce(titleI18n[$lang], title),
    "slug": slug.current,

    "postCount": count(*[
      _type == "post" &&
      status == "published" &&
      references(^._id)
    ]),

    // Use the newest related post's card image as the destination cover
    "coverImage": *[
      _type == "post" &&
      status == "published" &&
      references(^._id) &&
      defined(coverImage)
    ] | order(publishedAt desc, _createdAt desc)[0].coverImage->image
  }
`;

export async function getCountriesWithPosts(lang: 'it' | 'en' = 'it') {
  return client.fetch<CountryCard[]>(
    COUNTRIES_WITH_POSTS_QUERY,
    { lang },
    { next: { revalidate: 60 * 60 } },
  );
}
