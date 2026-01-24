// src/sanity/queries/homeHeroSlides.ts
import { client } from '@/sanity/lib/client';

export type SanityHomeHeroSlide = {
  _id: string;
  title?: string;
  alt?: string;
  image: unknown; // sanity image asset ref
  blurDataURL?: string;
};

const HOME_HERO_SLIDES_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    homeHeroSlides[]->{
      _id,
      title,
      alt,
      image,
      "blurDataURL": image.asset->metadata.lqip
    }
  }
`;

export async function getHomeHeroSlides() {
  const res = await client.fetch<{ homeHeroSlides?: SanityHomeHeroSlide[] }>(
    HOME_HERO_SLIDES_QUERY,
    {},
    { next: { revalidate: 60 * 60 } }, // 1h is fine; curated list doesn't change often
  );

  return res?.homeHeroSlides ?? [];
}
