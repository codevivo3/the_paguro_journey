type PlaylistLite = { id: string; title: string; description?: string };

type DestinationMatch = { slug: string; title: string };

/**
 * YouTube Playlists → Country mapping
 *
 * Goal (video-first Destinations): when a destination card is clicked, we prefer
 * linking to the most relevant YouTube playlist for that country.
 */
export function mapPlaylistsToCountries(
  playlists: PlaylistLite[],
  destinations: DestinationMatch[],
) {
  const keywordToSlug = new Map<string, string>();

  for (const d of destinations) {
    const slug = (d.slug ?? '').trim().toLowerCase();
    const title = (d.title ?? '').trim();
    if (!slug || !title) continue;

    const keyword = toHashtagKeyword(title);
    if (!keyword) continue;

    if (!keywordToSlug.has(keyword)) keywordToSlug.set(keyword, slug);
  }

  const map = new Map<string, string>();

  for (const p of playlists) {
    const tags = [
      ...extractHashtags(p.title ?? ''),
      ...extractHashtags(p.description ?? ''),
    ];

    const matchKeyword = tags.find((t) => keywordToSlug.has(t));
    if (!matchKeyword) continue;

    const countrySlug = keywordToSlug.get(matchKeyword);
    if (!countrySlug) continue;

    if (!map.has(countrySlug)) map.set(countrySlug, p.id);
  }

  return map;
}

export const playlistUrl = (id: string) =>
  `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;

const channelSearchUrl = (query: string) =>
  `https://www.youtube.com/@thepagurojourney/search?query=${encodeURIComponent(
    query,
  )}`;

/**
 * Build a channel search URL for a destination country.
 * Uses the destination title -> YouTube keyword (e.g. "Mongolia" -> "mongolia").
 */
export const channelSearchUrlForCountry = (countryTitle: string) => {
  const keyword = toHashtagKeyword(countryTitle);
  const q = keyword ? keyword : (countryTitle ?? '');
  return channelSearchUrl(q);
};

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

function toHashtagKeyword(title: string) {
  return (title ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '')
    .trim()
    .toLowerCase();
}

export type { PlaylistLite };
