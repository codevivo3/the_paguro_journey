/**
 * Utilities to map YouTube playlists to destination countries.
 *
 * Why this exists:
 * - YouTube playlists are often curated by country/series.
 * - We want to auto-link a Destinations card to the best YouTube landing page.
 *
 * Matching strategy (per playlist):
 * 1) Full country name match (e.g. "Mongolia")
 * 2) Hashtag keyword match derived from the country name (e.g. #mongolia, #costarica)
 * 3) (Optional) slug match (your internal destination slug) as a last-resort
 *
 * Important:
 * - Your destination slugs are ISO2 (e.g. "mn"). Great internally, NOT how people hashtag on YouTube.
 * - Therefore, any YouTube-search fallback MUST use a human-friendly keyword (country title / hashtag keyword).
 */

// Minimal playlist shape we need for mapping.
export type PlaylistLite = { id: string; title: string; description?: string };

/**
 * Extract hashtags from text.
 * - Supports normal '#' and fullwidth '＃'
 * - Captures until whitespace
 * - Cleans trailing punctuation like ',', '.', ')', ']' etc.
 *
 * Returns tags LOWERCASED and WITHOUT the leading '#'.
 */
function extractHashtags(text: string): string[] {
  const out: string[] = [];
  const re = /[#＃]([^\s#＃]+)/g;

  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const raw = (m[1] ?? '').trim();
    if (!raw) continue;

    const cleaned = raw
      .replace(/[.,!?:;\)\]\}]+$/g, '')
      .trim()
      .toLowerCase();

    if (cleaned) out.push(cleaned);
  }

  return out;
}

/**
 * Turn a country title into a YouTube-friendly hashtag keyword.
 * Examples:
 * - "Costa Rica" -> "costarica"
 * - "Côte d’Ivoire" -> "cotedivoire" (best-effort)
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
 * Checks whether a playlist text contains a country reference.
 * This is intentionally permissive: if the playlist title says "Mongolia", we accept it.
 */
function textContainsCountry(text: string, country: { title: string; slug: string }) {
  const t = (text ?? '').toLowerCase();
  const title = (country.title ?? '').toLowerCase();
  const slug = (country.slug ?? '').toLowerCase();
  return (title && t.includes(title)) || (slug && t.includes(slug));
}

/**
 * Build a channel-scoped YouTube search URL.
 * Note: YouTube's channel search is just keyword search.
 */
export function channelSearchUrl(query: string) {
  const q = (query ?? '').trim();
  return `https://www.youtube.com/@thepagurojourney/search?query=${encodeURIComponent(q)}`;
}

/**
 * Convenience: build a channel search URL for a destination country.
 * Uses the country TITLE (human-friendly), not ISO2 slug.
 */
export function channelSearchUrlForCountry(countryTitle: string) {
  const keyword = toHashtagKeyword(countryTitle);
  // If keyword is empty for some reason, fall back to the raw title.
  const q = keyword ? `#${keyword}` : (countryTitle ?? '');
  return channelSearchUrl(q);
}

/**
 * Map playlists to destination countries.
 *
 * For each playlist, we try to match one destination:
 * - Primary: full country name appears in title/description
 * - Secondary: playlist hashtags contain the country hashtag keyword (e.g. "costarica")
 * - Tertiary: playlist hashtags contain the destination slug (ISO2) (rare, last-resort)
 *
 * First match wins per destination (stable + deterministic).
 */
export function mapPlaylistsToCountries(
  playlists: PlaylistLite[],
  destinations: Array<{ slug: string; title: string }>,
) {
  const map = new Map<string, string>(); // countrySlug -> playlistId

  for (const p of playlists) {
    const haystack = `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase();
    const tags = [
      ...extractHashtags(p.title ?? ''),
      ...extractHashtags(p.description ?? ''),
    ];

    for (const d of destinations) {
      const slug = (d.slug ?? '').trim().toLowerCase();
      const title = (d.title ?? '').trim();
      if (!slug || !title) continue;
      if (map.has(slug)) continue; // first match wins

      // 1) Full country name match (best signal)
      if (textContainsCountry(haystack, { slug, title })) {
        map.set(slug, p.id);
        break;
      }

      // 2) Hashtag keyword match derived from country title
      const keyword = toHashtagKeyword(title);
      if (keyword && tags.includes(keyword)) {
        map.set(slug, p.id);
        break;
      }

      // 3) Last-resort: playlist contains ISO2 hashtag (unlikely, but harmless)
      if (tags.includes(slug)) {
        map.set(slug, p.id);
        break;
      }
    }
  }

  return map;
}

/**
 * YouTube playlist URL.
 */
export const playlistUrl = (id: string) =>
  `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;
