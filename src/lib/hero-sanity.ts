// src/lib/hero-sanity.ts
import { urlFor } from '@/sanity/lib/image';
import type { SanityHomeHeroSlide } from '@/sanity/queries/homeHeroSlides';

export type HeroSlide = {
  src: string;
  alt?: string;
  blurDataURL?: string;
};

export function mapSanityHeroSlides(
  slides:
    | SanityHomeHeroSlide[]
    | { desktop?: SanityHomeHeroSlide[]; mobile?: SanityHomeHeroSlide[] }
    | null
    | undefined,
  lang: 'it' | 'en' = 'it',
): HeroSlide[] {
  const list: SanityHomeHeroSlide[] = Array.isArray(slides)
    ? slides
    : slides?.desktop ?? slides?.mobile ?? [];

  return list
    .map((s) => {
      const src = s.image
        ? urlFor(s.image).width(2400).auto('format').quality(80).url()
        : '';

      if (!src) return null;

      const fallbackAlt = lang === 'en' ? 'Travel photo' : 'Foto di viaggio';

      return {
        src,
        alt: s.alt ?? s.titleResolved ?? s.captionResolved ?? fallbackAlt,
        blurDataURL: s.blurDataURL,
      };
    })
    .filter(Boolean) as HeroSlide[];
}
