import { urlFor } from '@/sanity/lib/image';
import type { AboutImage } from '@/sanity/queries/about';

export function mapSanityAboutImage(
  item: AboutImage,
  lang: 'it' | 'en' = 'it',
) {
  if (!item?.image) return null;

  const fallbackAlt =
    lang === 'en'
      ? 'The Paguro Journey team photo'
      : 'Foto del team The Paguro Journey';

  const src = urlFor(item.image).width(1400).auto('format').quality(80).url();

  return {
    src,
    alt: item.altA11yResolved ?? item.alt ?? fallbackAlt,
    caption: item.captionResolved ?? undefined,
  };
}
