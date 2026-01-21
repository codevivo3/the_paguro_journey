import { client } from '@/sanity/lib/client';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type CountryCard = {
  _id: string;
  title: string;
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
  ] | order(title asc) {
    _id,
    title,
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

export async function getCountriesWithPosts() {
  return client.fetch<CountryCard[]>(
    COUNTRIES_WITH_POSTS_QUERY,
    {},
    { next: { revalidate: 60 * 60 } },
  );
}
