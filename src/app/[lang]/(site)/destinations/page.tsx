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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  const countries = await getCountriesForDestinations({ preview: isEnabled });

  const destinations = countries.map((c) => {
    const r = getRegionFromCountry(c);

    const slug = (c.slug ?? '').trim();
    const title = (c.title ?? '').trim();

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

      // Display fields (used by cards)
      country: title,
      countrySlug: slug,
      region: regionName,
      regionSlug: typeof regionSlug === 'string' ? regionSlug : 'other',
      count: c.postCount,
      coverImage: c.coverImage,
      travelStyles,
    };
  });

  // Phase 1 (post-launch): video-first Destinations.
  // We show only countries that have tagged (videoTags) videos.
  // Also: avoid Shorts (best-effort) to keep the page consistent.
  const fetchCount = 50;
  const latestVideos = await getLatestRegularVideos(fetchCount);

  const nonShortVideos = latestVideos.filter((v) => {
    const title = (v.title ?? '').toLowerCase();
    const desc = (v.description ?? '').toLowerCase();
    // Best-effort: many Shorts include "#shorts" in title/description.
    return !title.includes('#shorts') && !desc.includes('#shorts');
  });

  const taggedVideos = withVideoTags(nonShortVideos, destinations);

  // Optional: playlists are the best UX for destination navigation.
  // We keep this resilient: if playlist fetching isn't available yet, we fall back to channel search.
  let playlists: PlaylistLite[] = [];
  try {
    // If you later add `getChannelPlaylistsLite()` to `@/lib/youtube/youtube`, this will auto-enable.
    const mod = await import('@/lib/youtube/youtube');
    const maybe = (mod as unknown as { getChannelPlaylistsLite?: () => Promise<PlaylistLite[]> })
      .getChannelPlaylistsLite;
    if (maybe) playlists = await maybe();
  } catch {
    // No-op: playlists remain empty.
  }

  const playlistByCountry = mapPlaylistsToCountries(playlists, destinations);

  if (process.env.NODE_ENV === 'development') {
    console.log('[Destinations][DEV] fetchedVideos:', latestVideos.length);
    console.log('[Destinations][DEV] nonShortVideos:', nonShortVideos.length);
    console.log('[Destinations][DEV] taggedVideos:', taggedVideos.length);
    console.log('[Destinations][DEV] playlists:', playlists.length);
    console.log('[Destinations][DEV] playlistByCountry size:', playlistByCountry.size);

    const sample = nonShortVideos.slice(0, 3).map((v) => ({
      id: v.id,
      title: v.title,
      // Descriptions can be long; show first 220 chars.
      descriptionPreview: (v.description ?? '').slice(0, 220),
      hasHashInTitle: (v.title ?? '').includes('#'),
      hasHashInDescription: (v.description ?? '').includes('#'),
    }));

    console.log(
      '[Destinations][DEV] sample raw videos (for hashtag check):',
      sample,
    );

    console.log(
      '[Destinations][DEV] extracted hashtags (desc):',
      nonShortVideos.slice(0, 3).map((v) => ({
        id: v.id,
        hashtags: debugExtractHashtags(v.description ?? '').slice(0, 12),
      })),
    );

    console.log(
      '[Destinations][DEV] last 400 chars (to see hashtags position):',
      nonShortVideos.slice(0, 2).map((v) => ({
        id: v.id,
        tail: (v.description ?? '').slice(-400),
      })),
    );

    console.log(
      '[Destinations][DEV] sample tagged slugs:',
      taggedVideos.slice(0, 5).map((v) => ({
        id: v.id,
        countrySlug: v.countrySlug,
        regionSlug: v.regionSlug,
      })),
    );
  }

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
  const visibleDestinations = Array.from(videoGroups.values())
    .map((g) => {
      const base = destinationsBySlug.get(g.countrySlug);
      if (!base) {
        // Fallback (in case a tag exists but the country isn't returned by Sanity yet)
        return {
          slug: g.countrySlug,
          title: g.countrySlug,
          country: g.countrySlug,
          countrySlug: g.countrySlug,
          region: '—',
          regionSlug: g.regionSlug,
          count: g.count,
          coverImage: null,
          travelStyles: [],
        };
      }

      return {
        ...base,
        // Video-first: card count is video count.
        count: g.count,
        // If Sanity country has no region, fall back to tag.
        regionSlug: base.regionSlug || g.regionSlug,
      };
    })
    .filter((d) => Boolean(d.slug) && Boolean(d.title));

  if (process.env.NODE_ENV === 'development') {
    console.log(
      '[Destinations][DEV] visibleDestinations:',
      visibleDestinations.map((d) => ({
        slug: d.slug,
        regionSlug: d.regionSlug,
        count: d.count,
      })),
    );
  }

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
      const hasStyle = (d.travelStyles ?? []).some((s) => s.slug === selectedStyle);
      if (!hasStyle) return false;
    }
    return true;
  });

  return (
    <main className='px-6 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>{effectiveLang === 'en' ? 'Destinations' : 'Destinazioni'}</h1>
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
        <section aria-label={effectiveLang === 'en' ? 'Destinations' : 'Destinazioni'} className='space-y-5 pb-16'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>{effectiveLang === 'en' ? 'Explore' : 'Esplora'}</h2>
            <span className='t-meta'>
              {filteredDestinations.length}{' '}
              {(() => {
                const n = filteredDestinations.length;
                if (effectiveLang === 'en') return n === 1 ? 'destination' : 'destinations';
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
                          : channelSearchUrlForCountry(d.country)
                      }
                      regionHref={withLangPrefix(`/destinations?region=${d.regionSlug}`, effectiveLang)}
                      country={d.country}
                      region={d.region}
                      count={d.count ?? 0}
                      coverSrc={coverSrc}
                      mediaAspect={mediaAspect}
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
