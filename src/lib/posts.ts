import { getDefaultCoverForCountry } from '@/lib/gallery';
// Temporary local content store (later this will come from Sanity).
// One content source → multiple “views” (Blog, Destinations, Videos) + small “fact chips”.
// This file also centralizes UI labels (REGION_META / STYLE_META) to avoid string duplication.

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

// Human-readable labels for UI (single source of truth).
// Later: these can be replaced by Sanity documents or i18n strings.
export const REGION_META: Record<Region, { label: string }> = {
  asia: { label: 'Asia' },
  europe: { label: 'Europa' },
  'north-america': { label: 'Nord America' },
  'central-america': { label: 'Centro America' },
  'south-america': { label: 'Sud America' },
  africa: { label: 'Africa' },
  oceania: { label: 'Oceania' },
  'middle-east': { label: 'Medio Oriente' },
  other: { label: 'Altro' },
};

export const STYLE_META: Record<TravelStyle, { label: string }> = {
  slow: { label: 'Slow' },
  mindful: { label: 'Mindful' },
  offtrack: { label: 'Off-track' },
  nature: { label: 'Natura' },
  culture: { label: 'Cultura' },
  budget: { label: 'Budget' },
  food: { label: 'Food' },
  adventure: { label: 'Avventura' },
};

function getRegionLabel(region: Region) {
  return REGION_META[region].label;
}

function getStyleLabel(style: TravelStyle) {
  return STYLE_META[style].label;
}

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
  // Source of truth lives in `src/lib/gallery.ts`.
  // Keep these only as optional overrides / legacy data.
  /** @deprecated Prefer gallery.ts helpers (default cover + gallery by countrySlug). */
  coverImage?: string;
  /** @deprecated Prefer gallery.ts helpers (default cover + gallery by countrySlug). */
  gallery?: string[];

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

// Facts are small “content chips” you can inject into grids (masonry / mixed lists).
// IMPORTANT: the goal here is to avoid duplicating labels everywhere.
// We store *machine tags* (regionSlug / style) and derive UI labels from REGION_META / STYLE_META.
export type FactScope = 'region' | 'style' | 'global';

export type Facts = {
  title: string;
  text: string;
  scope: FactScope;

  // Targeting tags (optional, depending on scope)
  regionSlug?: Region;
  style?: TravelStyle;

  // Optional UI override when the pill is NOT a region/style (e.g. “Attenzione”)
  pillLabel?: string;

  // --- Backwards-compatibility ------------------------------------------------
  // These fields are derived at runtime so older UI code keeps working.
  // Prefer using: `scope`, `regionSlug`, `style`, and `pillLabel`.
  /** @deprecated Derive from scope/regionSlug/style. */
  pill?: string;
  /** @deprecated Use `regionSlug` for the tag. */
  region?: Region;
};

// Raw facts: minimal data only (no duplicated region labels).
const RAW_FACTS: Omit<Facts, 'pill' | 'region'>[] = [
  {
    scope: 'region',
    regionSlug: 'asia',
    title: 'Curiosità \n\n Asia',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn dettaglio interessante sulla regione per spezzare la griglia.',
  },
  {
    scope: 'region',
    regionSlug: 'central-america',
    title: 'Curiosità \n\n Centro America',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Un dettaglio geografico che aiuta a capire il contesto. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn dettaglio geografico che aiuta a capire il contesto. Piccola nota di contesto o tip di viaggio.',
  },
  {
    scope: 'region',
    regionSlug: 'europe',
    title: 'Curiosità \n\n Europa',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn fatto storico o culturale raccontato in breve.',
  },

  // Travel-style facts (good for future filters / tags)
  {
    scope: 'style',
    style: 'mindful',
    title: 'Tip di viaggio',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn suggerimento pratico per viaggiare con più consapevolezza.',
  },
  {
    scope: 'style',
    style: 'culture',
    title: 'Lo sapevi?',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUna curiosità locale che difficilmente trovi nelle guide.',
  },
  {
    scope: 'style',
    style: 'adventure',
    title: 'Consiglio pratico',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn piccolo trucco che ti semplifica il viaggio.',
  },
  {
    scope: 'style',
    style: 'offtrack',
    title: 'Nota dal campo',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn appunto nato direttamente sul posto.',
  },
  {
    scope: 'style',
    style: 'slow',
    title: 'Viaggiare lento',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nPerché fermarsi più a lungo cambia il modo di vedere un luogo.',
  },

  // Global facts (not tied to a specific tag)
  {
    scope: 'global',
    pillLabel: 'Territorio',
    title: 'Geografia rapida',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Un dettaglio geografico che aiuta a capire il contesto. Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn dettaglio geografico che aiuta a capire il contesto.',
  },
  {
    scope: 'global',
    pillLabel: 'Storie',
    title: 'Piccola storia',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUn frammento narrativo che dà carattere al luogo.',
  },
  {
    scope: 'global',
    pillLabel: 'Attenzione',
    title: 'Errore comune',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUna cosa da evitare quando si visita questa zona.',
  },
  {
    scope: 'global',
    pillLabel: 'Diario',
    title: 'Osservazione',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. \n\nUna riflessione personale nata viaggiando.',
  },
];

function deriveFactPill(f: Omit<Facts, 'pill' | 'region'>): { pill: string; region?: Region } {
  if (f.scope === 'region' && f.regionSlug) {
    return { pill: getRegionLabel(f.regionSlug), region: f.regionSlug };
  }
  if (f.scope === 'style' && f.style) {
    return { pill: getStyleLabel(f.style) };
  }
  // global
  return { pill: f.pillLabel ?? 'Info' };
}

// Exported facts: enriched with derived fields for UI convenience.
export const facts: Facts[] = RAW_FACTS.map((f) => {
  const derived = deriveFactPill(f);
  return { ...f, ...derived };
});

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
      return {
        country: d.country,
        countrySlug: d.countrySlug,
        region: d.region,
        regionSlug: d.regionSlug,
        count: related.length,
        coverImage:
          d.coverImage ??
          getDefaultCoverForCountry(d.countrySlug) ??
          DESTINATION_PLACEHOLDER_COVER,
      };
    })
    .sort((a, b) => {
      if (a.regionSlug === b.regionSlug)
        return a.country.localeCompare(b.country);
      return a.regionSlug.localeCompare(b.regionSlug);
    });
}

// Backwards-compatible alias (used by older Destinations page code)
export function getDestinationsFromPosts(): DestinationCard[] {
  return getDestinationCards();
}
