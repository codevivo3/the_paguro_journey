

import { getHomeHeroSlides } from '@/sanity/queries/homeHeroSlides';
import { getHomeDivider, type HomeDividerData } from '@/sanity/queries/homeDivider';
import { mapSanityHeroSlides } from '@/lib/hero-sanity';
import type { Lang } from '@/lib/route';
import { getBreakImageProps } from '@/components/sections/BreakImageSection';

export type HomePageData = {
  slides: ReturnType<typeof mapSanityHeroSlides>;
  breakImageProps: ReturnType<typeof getBreakImageProps> | null;
};

export async function getHomePageData(lang: Lang): Promise<HomePageData> {
  const { desktop } = await getHomeHeroSlides(lang);
  const slides = mapSanityHeroSlides(desktop, lang);

  const homeDivider: HomeDividerData = await getHomeDivider(lang);
  const breakImageProps = getBreakImageProps(homeDivider, lang);

  return {
    slides,
    breakImageProps,
  };
}