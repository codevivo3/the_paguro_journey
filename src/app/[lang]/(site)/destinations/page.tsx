import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
type I18nString = {
  en?: string;
  it?: string;
  [key: string]: string | undefined;
};

type TravelStyleLite = { slug?: string; label?: string };

type CoverOrientation = 'portrait' | 'landscape' | 'square' | 'panorama';

type CountryForDestinations = {
  slug?: string;
  title?: string;
  nameI18n?: I18nString;
  titleI18n?: I18nString;
  postCount?: number;

  // Sanity cover image (mediaItem.image)
  coverImage?: SanityImageSource | null;

  // Option A: lock orientation + derived orientation helpers (from destinations query)
  coverLockOrientation?: boolean | null;
  coverOrientationEditor?: CoverOrientation | null;
  coverOriginalOrientation?: CoverOrientation | null;
  coverOrientationEffective?: CoverOrientation | null;
  coverDimensions?: { width?: number; height?: number; aspectRatio?: number } | null;

  // Optional focal point helpers (only present if your query returns them)
  coverHotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
  coverCrop?: { top?: number; bottom?: number; left?: number; right?: number } | null;

  travelStyles?: TravelStyleLite[];
  worldRegion?: RegionLike;
  region?: RegionLike;
};

type DestinationLite = {
  slug: string;
  title: string;
  youtubeTitle: string;
  country: string;
  countrySlug: string;
  region: string;
  regionSlug: string;
  count?: number;

  // Sanity cover image (mediaItem.image)
  coverImage?: SanityImageSource | null;

  // Option A: lock orientation + derived orientation helpers
  coverLockOrientation?: boolean | null;
  coverOrientationEffective?: CoverOrientation | null;
  coverOrientationEditor?: CoverOrientation | null;
  coverOriginalOrientation?: CoverOrientation | null;
  coverDimensions?: { width?: number; height?: number; aspectRatio?: number } | null;

  // Optional focal point helpers
  coverHotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
  coverCrop?: { top?: number; bottom?: number; left?: number; right?: number } | null;

  travelStyles: Array<{ slug: string; label: string }>;
};
import type { Metadata } from 'next';
import { draftMode } from 'next/headers';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import { DestinationCardClient } from '@/components/features/destinations/DestinationCardClient';
import DestinationsFilters from '@/components/features/destinations/DestinationsFilters';

import { getCountriesForDestinations } from '@/sanity/queries/destinations';

import { getGalleryImagesByCountry } from '@/lib/gallery';
import { urlFor } from '@/sanity/lib/image';
import { getLatestRegularVideos } from '@/lib/youtube/youtube';
import { withVideoTags } from '@/lib/youtube/withVideoTags';
import { getRegionShortTitle } from '@/domain/worldRegions';
import { safeLang, type Lang } from '@/lib/route';

type PageProps = {
  params: Promise<{ lang: Lang }>;
  searchParams?: Promise<DestinationsSearchParams>;
};

function withLangPrefix(path: string, lang: Lang) {
  if (lang === 'en') return path.startsWith('/en') ? path : `/en${path}`;
  return path;
}

/* -------------------------------------------------------------------------- */
/* SEO                                                                        */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const meta = {
    it: {
      title: 'Destinazioni | The Paguro Journey',
      description:
        'Esplora tutte le destinazioni di The Paguro Journey: paesi, regioni e racconti di viaggio tra blog, video e appunti pratici.',
      ogDescription:
        'Una mappa dei luoghi che abbiamo esplorato: destinazioni, regioni e articoli collegati.',
      ogAlt: 'The Paguro Journey — Destinazioni',
      locale: 'it_IT',
    },
    en: {
      title: 'Destinations | The Paguro Journey',
      description:
        'Explore all destinations on The Paguro Journey: countries, regions, and travel stories across blog posts, videos, and practical notes.',
      ogDescription:
        'A simple map of the places we explored: destinations, regions, and related posts.',
      ogAlt: 'The Paguro Journey — Destinations',
      locale: 'en_US',
    },
  } as const;

  const m = meta[effectiveLang];
  const canonical = withLangPrefix('/destinations', effectiveLang);

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical },
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      url: canonical,
      siteName: 'The Paguro Journey',
      type: 'website',
      locale: m.locale,
      images: [
        {
          url: '/destinations/images/cover/copertina-the-paguro-journey-1.jpg',
          width: 1200,
          height: 630,
          alt: m.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

type DestinationsSearchParams = {
  region?: string | string[];
  country?: string | string[];
  style?: string | string[];
};

type RegionLike = {
  // Long labels
  titleIt?: string;
  title?: string;

  // Short UI labels (pills/cards) — seeded by scripts/seed-world-regions.ts
  shortTitleIt?: string;
  shortTitle?: string;

  // Fallback legacy fields
  name?: string;
  label?: string;

  slug?: string | { current?: string };
} | null;

/**
 * YouTube Playlists → Country mapping
 *
 * Goal (video-first Destinations): when a destination card is clicked, we prefer
 * linking to the most relevant YouTube playlist for that country.
 *
 * Mapping strategy:
 * - Extract hashtags from playlist title/description
 * - Accept only matches that exist in our `destinations` list (prevents garbage)
 * - First match wins (stable + deterministic)
 */
type PlaylistLite = { id: string; title: string; description?: string };

function extractHashtags(text: string): string[] {
  const out: string[] = [];
  const re = /[#＃]([^\s#＃]+)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = (m[1] ?? '').trim();
    if (!raw) continue;

    // Strip trailing punctuation commonly seen after hashtags.
    const cleaned = raw
      .replace(/[.,!?:;\)\]\}]+$/g, '')
      .trim()
      .toLowerCase();

    if (cleaned) out.push(cleaned);
  }

  return out;
}

/**
 * Convert a destination title into a YouTube-friendly keyword.
 *
 * Examples:
 * - "Costa Rica"   -> "costarica"
 * - "Côte d’Ivoire" -> "cotedivoire" (best-effort)
 *
 * Why:
 * - Your destination slugs are ISO2 (e.g. "mn"). Great internal IDs, terrible YouTube keywords.
 * - Playlists / hashtags are usually human words, not ISO codes.
 */
function toHashtagKeyword(title: string) {
  return (title ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[’'`]/g, '') // strip apostrophes
    .replace(/[^a-zA-Z0-9\s-]/g, '') // drop other punctuation
    .replace(/[\s-]+/g, '') // remove spaces/hyphens
    .trim()
    .toLowerCase();
}

/**
 * Map playlists to destination countries.
 *
 * Matching strategy (per playlist):
 * - Extract hashtags from playlist title/description
 * - Consider destination keyword from title (e.g. "mongolia", "costarica")
 * - If ANY playlist hashtag equals the keyword, we map that playlist to the destination slug (ISO2)
 *
 * Notes:
 * - We keep ISO2 only as the returned key (stable internal ID).
 * - We do NOT use ISO2 for matching, because YouTube hashtags rarely use ISO codes.
 * - First match wins to keep results stable.
 */
function mapPlaylistsToCountries(
  playlists: PlaylistLite[],
  destinations: Array<{ slug: string; title: string }>,
) {
  // Build: keyword -> destinationSlug (ISO2)
  const keywordToSlug = new Map<string, string>();

  for (const d of destinations) {
    const slug = (d.slug ?? '').trim().toLowerCase();
    const title = (d.title ?? '').trim();
    if (!slug || !title) continue;

    const keyword = toHashtagKeyword(title);
    if (!keyword) continue;

    // If two countries would collide (rare), keep the first one.
    if (!keywordToSlug.has(keyword)) keywordToSlug.set(keyword, slug);
  }

  const map = new Map<string, string>(); // countrySlug(ISO2) -> playlistId

  for (const p of playlists) {
    const tags = [
      ...extractHashtags(p.title ?? ''),
      ...extractHashtags(p.description ?? ''),
    ];

    // Find the first hashtag that matches one of our destination keywords.
    const matchKeyword = tags.find((t) => keywordToSlug.has(t));
    if (!matchKeyword) continue;

    const countrySlug = keywordToSlug.get(matchKeyword);
    if (!countrySlug) continue;

    // First match wins per destination to keep mapping stable.
    if (!map.has(countrySlug)) map.set(countrySlug, p.id);
  }

  return map;
}

const playlistUrl = (id: string) =>
  `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;

/**
 * Channel-scoped YouTube search.
 *
 * IMPORTANT:
 * - This must NOT use ISO2 ("mn", "cn", ...).
 * - Use human keywords ("mongolia", "china", "costarica", ...).
 */
const channelSearchUrl = (query: string) =>
  `https://www.youtube.com/@thepagurojourney/search?query=${encodeURIComponent(
    query,
  )}`;

/**
 * Build a channel search URL for a destination country.
 * Uses the destination title -> YouTube keyword (e.g. "Mongolia" -> "mongolia").
 */
const channelSearchUrlForCountry = (countryTitle: string) => {
  const keyword = toHashtagKeyword(countryTitle);

  // Use a plain keyword search (no leading '#').
  // Hashtags are convenient when they exist, but channel search can be too strict
  // if the channel doesn’t use that exact hashtag format.
  const q = keyword ? keyword : (countryTitle ?? '');
  return channelSearchUrl(q);
};

/**
 * Local-only helper used for DEV logging.
 * This mirrors our robust hashtag extraction logic.
 */
function debugExtractHashtags(text: string): string[] {
  const out: string[] = [];
  const re = /[#＃]([^\s#＃]+)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = (m[1] ?? '').trim();
    if (!raw) continue;
    const cleaned = raw.replace(/[.,!?:;\)\]\}]+$/g, '').trim();
    if (cleaned) out.push(cleaned);
  }

  return out;
}

function getRegionFromCountry(country: unknown): RegionLike {
  if (!country || typeof country !== 'object') return null;
  const obj = country as { worldRegion?: RegionLike; region?: RegionLike };
  return obj.worldRegion ?? obj.region ?? null;
}

export default async function DestinationsPage({
  searchParams,
  params,
}: PageProps) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);
  const sp = searchParams ? await searchParams : undefined;

  const { isEnabled } = await draftMode();
  const countries: CountryForDestinations[] = await getCountriesForDestinations(
    {
      preview: isEnabled,
      lang: effectiveLang,
    },
  );

  const destinations: DestinationLite[] = countries.map((c) => {
    const r = getRegionFromCountry(c);

    const slug = (c.slug ?? '').trim();

    // Display title is localized (what we show on cards / filters)
    const title = (c.title ?? '').trim();

    // Matching title is language-agnostic: prefer English common name for YouTube/hashtags.
    // This avoids cases like IT "Figi" vs hashtag "#fiji".
    const youtubeTitle = (c.nameI18n?.en ?? c.titleI18n?.en ?? title).trim();

    const regionSlug =
      (r && (typeof r.slug === 'string' ? r.slug : r.slug?.current)) || 'other';

    const regionName = getRegionShortTitle(regionSlug, effectiveLang);

    // Travel styles (Option A): inferred from linked posts via the Sanity query.
    // Normalize to the filter engine shape: { slug, label }.
    const travelStyles = (c.travelStyles ?? [])
      .map((s) => ({
        slug: (s?.slug ?? '').trim(),
        label: (s?.label ?? '').trim(),
      }))
      .filter((s) => Boolean(s.slug) && Boolean(s.label));

    return {
      // Normalized fields (used by filter logic)
      slug,
      title,

      // YouTube matching helper (do NOT display)
      youtubeTitle,

      // Display fields (used by cards)
      country: title,
      countrySlug: slug,
      region: regionName,
      regionSlug: typeof regionSlug === 'string' ? regionSlug : 'other',
      count: c.postCount,
      coverImage: (c.coverImage ?? null) as SanityImageSource | null,

      // Option A: pass through Sanity-derived cover helpers
      coverLockOrientation: c.coverLockOrientation ?? null,
      coverOrientationEffective: c.coverOrientationEffective ?? null,
      coverOrientationEditor: c.coverOrientationEditor ?? null,
      coverOriginalOrientation: c.coverOriginalOrientation ?? null,
      coverDimensions: c.coverDimensions ?? null,
      coverHotspot: (c as unknown as { coverHotspot?: DestinationLite['coverHotspot'] }).coverHotspot ?? null,
      coverCrop: (c as unknown as { coverCrop?: DestinationLite['coverCrop'] }).coverCrop ?? null,

      travelStyles,
    };
  });

  // Phase 1 (post-launch): video-first Destinations.
  // We show only countries that have tagged (videoTags) videos.
  // Also: avoid Shorts (best-effort) to keep the page consistent.
  // Language: pass `effectiveLang` so youtube.ts can return localized title/description when available.
  const fetchCount = 50;
  const latestVideos = await getLatestRegularVideos(fetchCount, {
    lang: effectiveLang,
  });

  const nonShortVideos = latestVideos.filter((v) => {
    const title = (v.title ?? '').toLowerCase();
    const desc = (v.description ?? '').toLowerCase();
    // Best-effort: many Shorts include "#shorts" in title/description.
    return !title.includes('#shorts') && !desc.includes('#shorts');
  });

  const destinationsForMatching = destinations.map((d) => ({
    slug: d.slug,
    // Use stable English-ish title for hashtag matching
    title: d.youtubeTitle || d.title,
  }));

  const taggedVideos = withVideoTags(nonShortVideos, destinationsForMatching);

  // Optional: playlists are the best UX for destination navigation.
  // We keep this resilient: if playlist fetching isn't available yet, we fall back to channel search.
  let playlists: PlaylistLite[] = [];
  try {
    // If you later add `getChannelPlaylistsLite()` to `@/lib/youtube/youtube`, this will auto-enable.
    const mod = await import('@/lib/youtube/youtube');
    const maybe = (
      mod as unknown as {
        getChannelPlaylistsLite?: () => Promise<PlaylistLite[]>;
      }
    ).getChannelPlaylistsLite;
    if (maybe) playlists = await maybe();
  } catch {
    // No-op: playlists remain empty.
  }

  const playlistByCountry = mapPlaylistsToCountries(
    playlists,
    destinationsForMatching,
  );


  type VisibleDestination = Omit<DestinationLite, 'count'> & {
    count: number;
    coverImage: SanityImageSource | null;

    coverLockOrientation?: boolean | null;
    coverOrientationEffective?: CoverOrientation | null;
    coverOrientationEditor?: CoverOrientation | null;
    coverOriginalOrientation?: CoverOrientation | null;
    coverDimensions?: { width?: number; height?: number; aspectRatio?: number } | null;
    coverHotspot?: DestinationLite['coverHotspot'] | null;
    coverCrop?: DestinationLite['coverCrop'] | null;
  };
  // Group tagged videos by country.
  const videoGroups = new Map<
    string,
    { countrySlug: string; regionSlug: string; count: number }
  >();

  for (const v of taggedVideos) {
    const key = v.countrySlug;
    const existing = videoGroups.get(key);
    if (!existing) {
      videoGroups.set(key, {
        countrySlug: v.countrySlug,
        regionSlug: v.regionSlug,
        count: 1,
      });
    } else {
      existing.count += 1;
    }
  }

  const destinationsBySlug = new Map(destinations.map((d) => [d.slug, d]));

  // Build the list of destinations visible on this page.
  const visibleDestinations: VisibleDestination[] = Array.from(
    videoGroups.values(),
  )
    .map((g) => {
      const base = destinationsBySlug.get(g.countrySlug);
      if (!base) {
        const slug = g.countrySlug;
        return {
          slug,
          title: slug,
          youtubeTitle: slug,
          country: slug,
          countrySlug: slug,
          region: '—',
          regionSlug: g.regionSlug,
          count: g.count,
          coverImage: null,
          travelStyles: [],
        } satisfies VisibleDestination;
      }

      return {
        ...base,
        // Ensure the field exists for TS + downstream links
        youtubeTitle: base.youtubeTitle ?? base.title ?? base.country,
        // Video-first: card count is video count.
        count: g.count,
        // If Sanity country has no region, fall back to tag.
        regionSlug: base.regionSlug || g.regionSlug,
        // Keep nullable for the VisibleDestination type
        coverImage: base.coverImage ?? null,
      } satisfies VisibleDestination;
    })
    .filter((d) => Boolean(d.slug) && Boolean(d.title));


  // Server-side filtering for the grid (keep it local to avoid importing client-only logic).
  const selectedRegion = (
    Array.isArray(sp?.region) ? sp.region[0] : sp?.region || ''
  ).trim();
  const selectedCountry = (
    Array.isArray(sp?.country) ? sp.country[0] : sp?.country || ''
  ).trim();
  const selectedStyle = (
    Array.isArray(sp?.style) ? sp.style[0] : sp?.style || ''
  ).trim();

  const filteredDestinations = visibleDestinations.filter((d) => {
    if (selectedRegion && d.regionSlug !== selectedRegion) return false;
    if (selectedCountry && d.countrySlug !== selectedCountry) return false;
    if (selectedStyle) {
      const hasStyle = (d.travelStyles ?? []).some(
        (s) => s.slug === selectedStyle,
      );
      if (!hasStyle) return false;
    }
    return true;
  });

  return (
    <main className='px-6 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>
            {effectiveLang === 'en' ? 'Destinations' : 'Destinazioni'}
          </h1>
          <p className='t-page-subtitle'>
            {effectiveLang === 'en'
              ? 'A simple map of the places we explored — currently video-led, with stories and guides coming soon.'
              : 'Una mappa semplice dei luoghi che abbiamo esplorato — per ora guidata dai video, con storie e guide in arrivo.'}
          </p>
        </header>

        {/* Filters (URL-driven, server-safe) */}
        <DestinationsFilters
          lang={effectiveLang}
          destinations={visibleDestinations}
          searchParams={sp}
        />

        {/* Destinations */}
        <section
          aria-label={effectiveLang === 'en' ? 'Destinations' : 'Destinazioni'}
          className='space-y-5 pb-16'
        >
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>
              {effectiveLang === 'en' ? 'Explore' : 'Esplora'}
            </h2>
            <span className='t-meta'>
              {filteredDestinations.length}{' '}
              {(() => {
                const n = filteredDestinations.length;
                if (effectiveLang === 'en')
                  return n === 1 ? 'destination' : 'destinations';
                return n === 1 ? 'destinazione' : 'destinazioni';
              })()}
            </span>
          </div>

          {filteredDestinations.length === 0 ? (
            <div className='rounded-2xl border border-white/10 bg-white/5 p-6'>
              <p className='t-meta'>
                {effectiveLang === 'en'
                  ? 'No destinations match the selected filters (or there are no tagged videos yet).'
                  : 'Nessuna destinazione trovata con i filtri selezionati (o non ci sono ancora video taggati).'}
              </p>
              <p className='mt-2 text-sm opacity-70'>
                {effectiveLang === 'en'
                  ? 'Tip: add country hashtags in video descriptions (e.g. #thailand, #mongolia).'
                  : 'Suggerimento: aggiungete nel testo descrizione dei video hashtag paese (es. #thailand, #mongolia).'}
              </p>
            </div>
          ) : (
            <Masonry className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
              {filteredDestinations.map((d, i) => {
                const gallery = getGalleryImagesByCountry(d.slug);
                const localCover = gallery[0];
                const orientation = localCover?.orientation;

                const sanityCoverUrl = d.coverImage
                  ? urlFor(d.coverImage)
                      .width(1200)
                      .height(900)
                      .fit('crop')
                      .url()
                  : null;

                const coverSrc =
                  sanityCoverUrl ?? localCover?.src ?? '/world-placeholder.png';

                const mediaAspect =
                  orientation === 'portrait'
                    ? 'aspect-[3/4]'
                    : orientation === 'landscape'
                      ? 'aspect-video'
                      : i % 5 === 0
                        ? 'aspect-[4/5]'
                        : i % 3 === 0
                          ? 'aspect-[3/4]'
                          : 'aspect-video';

                return (
                  <MasonryItem key={d.slug}>
                    <DestinationCardClient
                      href={
                        playlistByCountry.get(d.slug)
                          ? playlistUrl(playlistByCountry.get(d.slug)!)
                          : channelSearchUrlForCountry(
                              d.youtubeTitle || d.country,
                            )
                      }
                      regionHref={withLangPrefix(
                        `/destinations?region=${d.regionSlug}`,
                        effectiveLang,
                      )}
                      country={d.country}
                      region={d.region}
                      count={d.count ?? 0}
                      coverSrc={coverSrc}
                      mediaAspect={mediaAspect}

                      // Option A: Sanity-aware cover props (lock + focal point)
                      coverImage={d.coverImage ?? undefined}
                      coverLockOrientation={d.coverLockOrientation ?? undefined}
                      coverOrientationEffective={d.coverOrientationEffective ?? undefined}
                      coverHotspot={d.coverHotspot ?? null}
                      coverCrop={d.coverCrop ?? null}
                    />
                  </MasonryItem>
                );
              })}
            </Masonry>
          )}
        </section>
      </div>
    </main>
  );
}
