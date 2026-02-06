// src/lib/gallery-sanity.ts
import { urlFor } from '@/sanity/lib/image';
import type { SanityGalleryItem } from '@/sanity/queries/gallery';

// If you can import the real type, do it (best):
// import type { GalleryImage } from '@/components/gallery/GalleryGrid';

type GalleryMapperInput = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  countrySlug: string;

  // Sanity image + focal point helpers (for MediaImage)
  sanityImage: SanityGalleryItem['image'];
  hotspot?: SanityGalleryItem['hotspot'] | null;
  crop?: SanityGalleryItem['crop'] | null;

  // Layout helpers
  orientation?: 'portrait' | 'landscape' | 'square' | 'panorama';
  originalOrientation?: 'portrait' | 'landscape' | 'square' | 'panorama';
  lockOrientation?: boolean;

  // optional tags if your grid uses them later
  countries?: string[];
  regions?: string[];
  styles?: string[];
};

export function mapSanityToGalleryImages<TGalleryImage extends Record<string, unknown>>(
  items: SanityGalleryItem[],
  lang: 'it' | 'en' = 'it',
  map: (x: GalleryMapperInput) => Partial<TGalleryImage>,
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

      const base: GalleryMapperInput = {
        id: it._id,
        src,
        // Prefer localized accessibility alt if provided by the query
        alt: it.altA11yResolved ?? it.alt ?? it.title ?? fallbackAlt,
        caption: clean(
          it.captionResolved ??
            getPlainCaption(it) ??
            (lang === 'en'
              ? it.captionI18n?.en ?? it.captionI18n?.it
              : it.captionI18n?.it ?? it.captionI18n?.en),
        ),

        // ✅ pick the first country slug (or fallback)
        countrySlug: countries?.[0] ?? 'unknown',

        // Pass through Sanity image + focal point info so MediaImage can build focalpoint-aware URLs
        sanityImage: it.image,
        hotspot: it.hotspot ?? null,
        crop: it.crop ?? null,

        // Orientation coming from Sanity query:
        // - `it.orientation` is already the *effective* orientation (locked or manual)
        // - `it.originalOrientation` is derived from asset dimensions
        // - `it.lockOrientation` tells the UI to avoid layout transforms for this item
        orientation:
          it.orientation === 'portrait' ||
          it.orientation === 'landscape' ||
          it.orientation === 'square' ||
          it.orientation === 'panorama'
            ? it.orientation
            : undefined,

        originalOrientation:
          it.originalOrientation === 'portrait' ||
          it.originalOrientation === 'landscape' ||
          it.originalOrientation === 'square' ||
          it.originalOrientation === 'panorama'
            ? it.originalOrientation
            : undefined,

        lockOrientation: Boolean(it.lockOrientation),

        countries,
        regions: it.regions?.map((r) => r.slug ?? r.title ?? '').filter(Boolean),
        styles: it.travelStyles
          ?.map((s) => s.slug ?? s.title ?? '')
          .filter(Boolean),
      };

      // IMPORTANT:
      // We ALWAYS include focal-point fields (sanityImage/hotspot/crop) even if the caller forgets to.
      // The caller can still override anything by returning it from `map(base)`.
      const mapped = (map(base) ?? {}) as Partial<TGalleryImage>;

      return {
        ...base,
        ...mapped,
      } as unknown as TGalleryImage;
    })
    .filter(Boolean) as TGalleryImage[];
}
