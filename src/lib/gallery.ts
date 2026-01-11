export type GalleryImage = {
  src: string;
  countrySlug: string;
  alt?: string;
  orientation?: 'portrait' | 'landscape';
};

type GalleryCountry = {
  countrySlug: string;
  basePath: string;
  images: {
    filename: string;
    alt?: string;
    orientation?: 'portrait' | 'landscape';
  }[];
};

export type HeroSlide = { src: string; alt?: string };

// Country-grouped gallery source of truth.
// This avoids repeating `/destinations/<country>` and `countrySlug` for every image.
// Later this can be replaced by Sanity (or generated automatically).
const GALLERY_COUNTRIES: GalleryCountry[] = [
  {
    countrySlug: 'cover',
    basePath: '/destinations/cover',
    images: [
      { filename: 'copertina-the-paguro-journey-1.jpg', orientation: 'landscape' },
    ],
  },
  {
    countrySlug: 'antigua',
    basePath: '/destinations/antigua',
    images: [
      { filename: 'antigua-drone-10.jpg' },
      { filename: 'antigua-drone-20.jpg' },
      { filename: 'antigua-volti-di-antigua.jpg' },
    ],
  },
  {
    countrySlug: 'china',
    basePath: '/destinations/china',
    images: [
      { filename: 'mattia-tiger-leaping-gorge.jpg', orientation: 'landscape' },
      { filename: 'campi-terrazzati-yuan-yang.jpg' },
      { filename: 'cina-ponte-guangxi.jpg' },
    ],
  },
  {
    countrySlug: 'costa-rica',
    basePath: '/destinations/costa-rica',
    images: [
      { filename: 'costarica-drone-010.jpg' },
      { filename: 'costarica-drone-020.jpg' },
      { filename: 'costarica-drone-030.jpg' },
    ],
  },
  {
    countrySlug: 'guatemala',
    basePath: '/destinations/guatemala',
    images: [
      { filename: 'guatemala-chichi-10.jpg' },
      { filename: 'guatemala-chichi.jpg' },
      { filename: 'guatemala-mattia-cammina-chichi.jpg' },
      { filename: 'guatemala-piramide-20.jpg' },
      { filename: 'guatemala-piramide-stretto.jpg' },
      { filename: 'guatemala-piramide.jpg' },
      { filename: 'guatemala-san-juan.jpg' },
      { filename: 'guatemala-vale-cammina.jpg' },
      { filename: 'guatemala-vale-datch-angle.jpg' },
      { filename: 'guatemala-vale-piramide.jpg' },
      { filename: 'guatemala-vale-spalle-yaxha.jpg' },
      { filename: 'mattia-vlogga-guatemala.jpg' },
    ],
  },
  {
    countrySlug: 'mongolia',
    basePath: '/destinations/mongolia',
    images: [
      { filename: 'vale-duna-gobi.jpg' },
      { filename: 'vale-mattia-in-tenda.jpg' },
      { filename: 'valentina-on-the-road.jpg' },
    ],
  },
];

export const HERO_SLIDES: HeroSlide[] = GALLERY_COUNTRIES
  .map((country) => {
    const firstImage = country.images[0];
    if (!firstImage) return null;

    const src = `${country.basePath}/${firstImage.filename}`;

    // With `exactOptionalPropertyTypes`, you must NOT set an optional prop to `undefined`.
    // Only include `alt` when it's actually defined.
    return firstImage.alt
      ? ({ src, alt: firstImage.alt } satisfies HeroSlide)
      : ({ src } satisfies HeroSlide);
  })
  .filter((slide): slide is HeroSlide => slide !== null);

export function getGalleryImages(): GalleryImage[] {
  return GALLERY_COUNTRIES.filter((country) => country.countrySlug !== 'cover') // exclude hero-only assets
    .flatMap((country) =>
      country.images.map((img) => ({
        src: `${country.basePath}/${img.filename}`,
        countrySlug: country.countrySlug,
        alt: img.alt,
        orientation: img.orientation,
      }))
    );
}

// Return ALL images for a given countrySlug, in the same order as GALLERY_COUNTRIES
export function getGalleryImagesByCountry(countrySlug: string): GalleryImage[] {
  const country = GALLERY_COUNTRIES.find((c) => c.countrySlug === countrySlug);
  if (!country) return [];

  return country.images.map((img) => ({
    src: `${country.basePath}/${img.filename}`,
    countrySlug: country.countrySlug,
    alt: img.alt,
    orientation: img.orientation,
  }));
}

// First image of the destination → best default cover
export function getDefaultCoverForCountry(countrySlug?: string): string | undefined {
  if (!countrySlug) return undefined;
  const imgs = getGalleryImagesByCountry(countrySlug);
  return imgs[0]?.src;
}

// Next images → good default gallery (skip cover)
export function getDefaultGalleryForCountry(
  countrySlug?: string,
  limit = 6
): string[] {
  if (!countrySlug) return [];
  const imgs = getGalleryImagesByCountry(countrySlug);
  return imgs.slice(1, 1 + limit).map((i) => i.src);
}

/* -------------------------------------------------------------------------- */
/* Blog helpers                                                               */
/* -------------------------------------------------------------------------- */

// Minimal shape we need from a Post to resolve images.
// Supports your current `posts.tsx` structure (`destination.countrySlug`) and
// also allows a direct `countrySlug` field if you ever add it.
export type PostLikeForGallery = {
  gallery?: string[];
  destination?: { countrySlug: string };
  countrySlug?: string;
};

/**
 * resolvePostGallery
 *
 * Returns a stable list of image `src` strings for a post.
 * Priority:
 *  1) post.gallery (explicit, hand-curated)
 *  2) gallery for post.destination.countrySlug (auto)
 *  3) empty array
 */
export function resolvePostGallery(post: PostLikeForGallery, limit = 6): string[] {
  // 1) Explicit gallery defined on the post → highest priority
  if (post.gallery?.length) return post.gallery.slice(0, limit);

  // 2) Fallback: use the destination gallery
  const countrySlug = post.destination?.countrySlug ?? post.countrySlug;
  if (!countrySlug) return [];

  // Use the country gallery as source-of-truth.
  // We skip the first image (usually used as cover) to keep “inline gallery” varied.
  return getDefaultGalleryForCountry(countrySlug, limit);
}

/* -------------------------------------------------------------------------- */
/* Semantic accessors (readability wins)                                      */
/* -------------------------------------------------------------------------- */

/** First image from a resolved gallery array (safe). */
export function getHeroImage(gallery: string[]): string | undefined {
  return gallery.at(0);
}

/** Get any inline image from the resolved gallery (safe). */
export function getInlineImage(gallery: string[], index: number): string | undefined {
  return gallery.at(index);
}