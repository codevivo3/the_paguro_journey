// src/lib/posts.tsx
// Temporary local content store (later this will come from Sanity).
// One content source → multiple “views” (Blog, Destinations, Videos).

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
    country: string; // e.g. "China"
    countrySlug: string; // e.g. "china"
    region: string; // e.g. "Asia"
    regionSlug: Region;
  };

  // Optional “labels” you can later map to Sanity tags
  styles?: TravelStyle[];
};

// --- Local data -------------------------------------------------------------

export const posts: Post[] = [
  {
    slug: 'viaggiare-in-cina-nel-2024',
    title: 'Viaggiare in Cina nel 2024',
    excerpt: 'Racconti e consigli di viaggio 🇨🇳.',
    date: '02/01/2026',
    media: {
      kind: 'youtube-playlist',
      url: 'https://www.youtube.com/watch?v=V5M__hG4dV8&list=PLstiwxBQHBusIpFOMNlsJf4Ekoin0XJTy',
    },
    coverImage: '/destinations/china/cina-ponte-guangxi.jpg',
    gallery: [
      '/destinations/china/mattia-tiger-leaping-gorge.jpg',
      '/destinations/china/campi-terrazzati-yuan-yang.jpg',
    ],
    destination: {
      country: 'China',
      countrySlug: 'china',
      region: 'Asia',
      regionSlug: 'asia',
    },
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
    destination: {
      country: 'Guatemala',
      countrySlug: 'guatemala',
      region: 'Central America',
      regionSlug: 'central-america',
    },
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
    destination: {
      country: 'Mongolia',
      countrySlug: 'mongolia',
      region: 'Asia',
      regionSlug: 'asia',
    },
    styles: ['nature', 'adventure', 'offtrack'],
  },
];

// --- Helpers (tiny + practical) --------------------------------------------

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllPosts(): Post[] {
  return posts;
}

// Build destination “cards” from posts (Destinations page can be derived).
export type DestinationCard = {
  country: string;
  countrySlug: string;
  region: string;
  regionSlug: Region;
  count: number;
  coverImage?: string;
};

export function getDestinationsFromPosts(): DestinationCard[] {
  const map = new Map<string, DestinationCard>();

  for (const post of posts) {
    const d = post.destination;
    if (!d) continue;

    const key = d.countrySlug;
    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        country: d.country,
        countrySlug: d.countrySlug,
        region: d.region,
        regionSlug: d.regionSlug,
        count: 1,
        coverImage: post.coverImage,
      });
      continue;
    }

    existing.count += 1;
    // Keep first coverImage found as the card cover
    if (!existing.coverImage && post.coverImage) existing.coverImage = post.coverImage;
  }

  // Stable ordering: region then country
  return Array.from(map.values()).sort((a, b) => {
    if (a.regionSlug === b.regionSlug) return a.country.localeCompare(b.country);
    return a.regionSlug.localeCompare(b.regionSlug);
  });
}

export function getPostsByCountrySlug(countrySlug: string): Post[] {
  return posts.filter((p) => p.destination?.countrySlug === countrySlug);
}
