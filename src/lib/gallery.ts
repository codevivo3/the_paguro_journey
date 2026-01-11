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

// Country-grouped gallery source of truth.
// This avoids repeating `/destinations/<country>` and `countrySlug` for every image.
// Later this can be replaced by Sanity (or generated automatically).
const GALLERY_COUNTRIES: GalleryCountry[] = [
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
      { filename: 'campi-terrazzati-yuan-yang.jpg' },
      { filename: 'cina-ponte-guangxi.jpg' },
      { filename: 'mattia-tiger-leaping-gorge.jpg', orientation: 'landscape' },
    ],
  },
  {
    countrySlug: 'costarica',
    basePath: '/destinations/costarica',
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

export function getGalleryImages(): GalleryImage[] {
  return GALLERY_COUNTRIES.flatMap((country) =>
    country.images.map((img) => ({
      src: `${country.basePath}/${img.filename}`,
      countrySlug: country.countrySlug,
      alt: img.alt,
      orientation: img.orientation,
    }))
  );
}
