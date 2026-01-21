import { urlFor } from '@/sanity/lib/image';
import type { SanityAboutImage } from '@/sanity/queries/aboutImage';

export function mapSanityAboutImage(item: SanityAboutImage | null) {
  if (!item?.image) return null;

  const src = urlFor(item.image).width(1400).auto('format').quality(80).url();

  return {
    src,
    alt: item.alt ?? item.title ?? 'Foto del team The Paguro Journey',
    caption: item.caption ?? undefined,
  };
}
