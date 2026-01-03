// src/lib/posts.tsx
// Temporary local content store (later this will come from Sanity).

// One content source → multiple “views” (Blog, Destinations, Videos).

// Default cover used when a destination (and its related posts) have no image yet.
// File must exist in `/public`.
const DESTINATION_PLACEHOLDER_COVER = '/world-placeholder.png';

export type Region =
  | 'asia'
  | 'europe'
  | 'north-america'
  | 'central-america'
  | 'south-america'
  | 'africa'
  | 'oceania'
  | 'middle-east'
  | 'other';

export type TravelStyle =
  | 'slow'
  | 'mindful'
  | 'offtrack'
  | 'nature'
  | 'culture'
  | 'budget'
  | 'food'
  | 'adventure';

export type MediaKind = 'youtube-video' | 'youtube-playlist' | 'external';

export type Post = {
  // Routing
  slug: string;

  // Core content
  title: string;
  excerpt: string;
  content?: string[];
  date?: string; // ISO string when you have it (e.g. "2026-01-02")

  // Media (for now: YouTube link or playlist)
  media?: {
    kind: MediaKind;
    url: string;
  };

  // Images
  coverImage?: string; // used for cards/hero on blog list
  gallery?: string[]; // optional additional images

  // Taxonomy (Destinations are NOT a separate content type — just metadata)
  destination?: {
    countrySlug: string; // must match a record in `destinations`
  };

  // Optional “labels” you can later map to Sanity tags
  styles?: TravelStyle[];
};

export type Destination = {
  country: string; // Human label (IT)
  countrySlug: string; // URL + folder name in /public/destinations/<countrySlug>
  region: string; // Human label (IT)
  regionSlug: Region; // Machine label
  coverImage?: string; // Optional default cover (fallback)
};

// Canonical list of destinations (derived from your /public/destinations/* folders).
// Later: this becomes a Sanity document type.
// NOTE: we keep `coverImage` optional on purpose.
// Until Sanity is wired, we avoid stuffing the repo with “fake” cover files.
// If a destination has no post cover yet, we fall back to `DESTINATION_PLACEHOLDER_COVER`.
export const destinations: Destination[] = [
  {
    country: 'Cina',
    countrySlug: 'china',
    region: 'Asia',
    regionSlug: 'asia',
  },
  {
    country: 'Costa Rica',
    countrySlug: 'costa-rica',
    region: 'Centro America',
    regionSlug: 'central-america',
  },
  {
    country: 'Fiji',
    countrySlug: 'fiji',
    region: 'Oceania',
    regionSlug: 'oceania',
  },
  {
    country: 'Guatemala',
    countrySlug: 'guatemala',
    region: 'Centro America',
    regionSlug: 'central-america',
  },
  {
    country: 'Islanda',
    countrySlug: 'iceland',
    region: 'Europa',
    regionSlug: 'europe',
  },
  {
    country: 'Indonesia',
    countrySlug: 'indonesia',
    region: 'Asia',
    regionSlug: 'asia',
  },
  {
    country: 'Kirghizistan',
    countrySlug: 'kyrgyzstan',
    region: 'Asia',
    regionSlug: 'asia',
  },
  {
    country: 'Mongolia',
    countrySlug: 'mongolia',
    region: 'Asia',
    regionSlug: 'asia',
  },
  {
    country: 'Nicaragua',
    countrySlug: 'nicaragua',
    region: 'Centro America',
    regionSlug: 'central-america',
  },
  {
    country: 'Transilvania',
    countrySlug: 'transylvania',
    region: 'Europa',
    regionSlug: 'europe',
  },
];

// --- Local data -------------------------------------------------------------

export const posts: Post[] = [
  {
    slug: 'viaggiare-in-cina-nel-2024',
    title: 'Viaggiare in Cina nel 2024',
    excerpt: 'Racconti e consigli di viaggio 🇨🇳.',
    date: '2026-01-02',
    media: {
      kind: 'youtube-playlist',
      url: 'https://www.youtube.com/watch?v=V5M__hG4dV8&list=PLstiwxBQHBusIpFOMNlsJf4Ekoin0XJTy',
    },
    coverImage: '/destinations/china/cina-ponte-guangxi.jpg',
    gallery: [
      '/destinations/china/mattia-tiger-leaping-gorge.jpg',
      '/destinations/china/campi-terrazzati-yuan-yang.jpg',
    ],
    destination: { countrySlug: 'china' },
    styles: ['mindful', 'offtrack', 'culture'],
  },
  {
    slug: 'viaggio-in-centro-america-2025',
    title: 'Viaggio in Centro America 2025',
    excerpt: 'Dal Costa Rica al Nicaragua 🇨🇷 🇬🇹 🇳🇮.',
    media: {
      kind: 'youtube-playlist',
      url: 'https://www.youtube.com/playlist?list=PLstiwxBQHBuslSuTlFVBrn6ln_PFQihyO',
    },
    coverImage: '/destinations/guatemala/guatemala-mattia-cammina-chichi.jpg',
    gallery: [
      '/destinations/guatemala/guatemala-vale-datch-angle.jpg',
      '/destinations/antigua/antigua-volti-di-antigua.jpg',
    ],
    destination: { countrySlug: 'guatemala' },
    styles: ['offtrack', 'culture', 'adventure'],
  },
  {
    slug: 'esplorando-la-mongolia',
    title: 'Esplorando la Mongolia',
    excerpt: 'Un viaggio avventuroso in Asia Centrale 🇲🇳.',
    media: {
      kind: 'youtube-playlist',
      url: 'https://www.youtube.com/playlist?list=PLstiwxBQHButvJMlFXsP6sd4gkC3wFuEL',
    },
    coverImage: '/destinations/mongolia/vale-duna-gobi.jpg',
    gallery: [
      '/destinations/mongolia/vale-mattia-in-tenda.jpg',
      '/destinations/mongolia/valentina-on-the-road.jpg',
    ],
    destination: { countrySlug: 'mongolia' },
    styles: ['nature', 'adventure', 'offtrack'],
  },
  // --- Placeholder posts (to test destination cards + fallback cover) --------
  {
    slug: 'viaggio-in-costa-rica',
    title: 'Viaggio in Costa Rica',
    excerpt: 'Natura, vulcani e pura energia tropicale. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'costa-rica' },
    styles: ['nature', 'adventure', 'mindful'],
  },
  {
    slug: 'viaggio-alle-fiji',
    title: 'Viaggio alle Fiji',
    excerpt: 'Lagune e isole remote nel Pacifico. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'fiji' },
    styles: ['slow', 'mindful', 'nature'],
  },
  {
    slug: 'viaggio-in-islanda',
    title: 'Viaggio in Islanda',
    excerpt: 'Ghiaccio, fuoco e strade infinite. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'iceland' },
    styles: ['nature', 'offtrack', 'adventure'],
  },
  {
    slug: 'viaggio-in-indonesia',
    title: 'Viaggio in Indonesia',
    excerpt: 'Isole, templi e ritmo lento. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'indonesia' },
    styles: ['slow', 'culture', 'mindful'],
  },
  {
    slug: 'viaggio-in-kirghizistan',
    title: 'Viaggio in Kirghizistan',
    excerpt: 'Montagne, steppe e vita nomade. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'kyrgyzstan' },
    styles: ['offtrack', 'adventure', 'nature'],
  },
  {
    slug: 'viaggio-in-nicaragua',
    title: 'Viaggio in Nicaragua',
    excerpt: 'Tra surf, laghi e piccoli villaggi. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'nicaragua' },
    styles: ['budget', 'offtrack', 'adventure'],
  },
  {
    slug: 'viaggio-in-transilvania',
    title: 'Viaggio in Transilvania',
    excerpt: 'Castelli, foreste e strade secondarie. (Placeholder)',
    date: '2026-01-03',
    media: {
      kind: 'external',
      url: 'https://example.com',
    },
    destination: { countrySlug: 'transylvania' },
    styles: ['culture', 'offtrack', 'mindful'],
  },
];

// --- Helpers (tiny + practical) --------------------------------------------

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): Post[] {
  return posts;
}

export function getPostsByCountrySlug(countrySlug: string): Post[] {
  return posts.filter((p) => p.destination?.countrySlug === countrySlug);
}

// Build destination “cards” by merging canonical destinations with post counts.
export type DestinationCard = {
  country: string;
  countrySlug: string;
  region: string;
  regionSlug: Region;
  count: number;
  coverImage?: string;
};

export function getDestinationCards(): DestinationCard[] {
  return destinations
    .map((d) => {
      const related = getPostsByCountrySlug(d.countrySlug);
      const coverFromPost = related[0]?.coverImage;

      return {
        country: d.country,
        countrySlug: d.countrySlug,
        region: d.region,
        regionSlug: d.regionSlug,
        count: related.length,
        coverImage: coverFromPost ?? d.coverImage ?? DESTINATION_PLACEHOLDER_COVER,
      };
    })
    .sort((a, b) => {
      if (a.regionSlug === b.regionSlug) return a.country.localeCompare(b.country);
      return a.regionSlug.localeCompare(b.regionSlug);
    });
}

// Backwards-compatible alias (used by older Destinations page code)
export function getDestinationsFromPosts(): DestinationCard[] {
  return getDestinationCards();
}
