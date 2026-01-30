import { urlFor } from '@/sanity/lib/image';
import type { SanityAboutImage } from '@/sanity/queries/aboutImage';

export function mapSanityAboutImage(
  item: SanityAboutImage | null,
  lang: 'it' | 'en' = 'it'
) {
  if (!item?.image) return null;

  const fallbackAlt =
    lang === 'en'
      ? 'The Paguro Journey team photo'
      : 'Foto del team The Paguro Journey';

  const src = urlFor(item.image).width(1400).auto('format').quality(80).url();

  return {
    src,
    alt: item.alt ?? item.title ?? fallbackAlt,
    caption: item.caption ?? undefined,
  };
}
