// src/lib/hero-sanity.ts
import { urlFor } from '@/sanity/lib/image';
import type { SanityHomeHeroSlide } from '@/sanity/queries/homeHeroSlides';

export type HeroSlide = {
  src: string;
  alt?: string;
};

export function mapSanityHeroSlides(
  slides: SanityHomeHeroSlide[],
): HeroSlide[] {
  return slides
    .map((s) => {
      const src = s.image
        ? urlFor(s.image).width(2400).auto('format').quality(80).url()
        : '';

      if (!src) return null;

      return {
        src,
        alt: s.alt ?? s.title ?? 'Foto di viaggio',
      };
    })
    .filter(Boolean) as HeroSlide[];
}
