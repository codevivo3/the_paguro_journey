

import { getHomeHeroSlides } from '@/sanity/queries/homeHeroSlides';
import { getHomeDivider } from '@/sanity/queries/homeDivider';
import { mapSanityHeroSlides } from '@/lib/hero-sanity';
import type { Lang } from '@/lib/route';
import { getBreakImageProps } from '@/components/sections/BreakImageSection';

export type HomePageData = {
  hero: {
    slidesDesktop: ReturnType<typeof mapSanityHeroSlides>;
    slidesMobile: ReturnType<typeof mapSanityHeroSlides>;
  };
  breakImageProps: ReturnType<typeof getBreakImageProps> | null;
};

export async function getHomePageData(lang: Lang): Promise<HomePageData> {
  const { desktop, mobile } = await getHomeHeroSlides(lang);

  const slidesDesktop = mapSanityHeroSlides(desktop, lang);
  const slidesMobile = mapSanityHeroSlides(mobile, lang);

  const homeDivider = await getHomeDivider(lang);
  const breakImageProps = getBreakImageProps(homeDivider, lang);

  return {
    hero: {
      slidesDesktop,
      slidesMobile,
    },
    breakImageProps,
  };
}