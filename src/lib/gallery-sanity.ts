// src/lib/gallery-sanity.ts
import { urlFor } from '@/sanity/lib/image';
import type { SanityGalleryItem } from '@/sanity/queries/gallery';

// If you can import the real type, do it (best):
// import type { GalleryImage } from '@/components/gallery/GalleryGrid';

export function mapSanityToGalleryImages<TGalleryImage>(
  items: SanityGalleryItem[],
  lang: 'it' | 'en' = 'it',
  map: (x: {
    id: string;
    src: string;
    alt: string;
    caption?: string;
    countrySlug: string;
    // optional tags if your grid uses them later
    orientation?: 'portrait' | 'landscape' | 'square';
    countries?: string[];
    regions?: string[];
    styles?: string[];
  }) => TGalleryImage,
): TGalleryImage[] {
  return items
    .map((it) => {
      const src = it.image
        ? urlFor(it.image).width(1600).auto('format').quality(80).url()
        : '';

      if (!src) return null;

      const countries = it.countries
        ?.map((c) => c.slug ?? c.title ?? '')
        .filter(Boolean);

      const fallbackAlt = lang === 'en' ? 'Gallery image' : 'Immagine della galleria';

      const clean = (v?: string | null) => {
        const s = (v ?? '').trim();
        return s.length ? s : undefined;
      };

      const getPlainCaption = (item: SanityGalleryItem): string | undefined => {
        return 'caption' in item && typeof (item as { caption?: unknown }).caption === 'string'
          ? (item as { caption?: string }).caption
          : undefined;
      };

      return map({
        id: it._id,
        src,
        // Prefer localized accessibility alt if provided by the query
        alt: it.altA11yResolved ?? it.alt ?? it.title ?? fallbackAlt,
        caption: clean(
          it.captionResolved ??
            getPlainCaption(it) ??
            (lang === 'en'
              ? it.captionI18n?.en ?? it.captionI18n?.it
              : it.captionI18n?.it ?? it.captionI18n?.en)
        ),
        
        // ✅ pick the first country slug (or fallback)
        countrySlug: countries?.[0] ?? 'unknown',

        // Normalize to UI-supported values
        orientation:
          it.orientation === 'portrait' || it.orientation === 'landscape'
            ? it.orientation
            : undefined,

        countries,
        regions: it.regions
          ?.map((r) => r.slug ?? r.title ?? '')
          .filter(Boolean),
        styles: it.travelStyles
          ?.map((s) => s.slug ?? s.title ?? '')
          .filter(Boolean),
      });
    })
    .filter(Boolean) as TGalleryImage[];
}
