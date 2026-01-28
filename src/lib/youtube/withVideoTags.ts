import type { YouTubeVideo } from './youtube';

/**
 * Minimal destination shape needed for video tag inference.
 * We pass this from Sanity-seeded countries (already enriched with worldRegion).
 */
export type DestinationForVideoTagging = {
  slug: string;
  title: string;
  regionSlug?: string;
};

/**
 * A YouTube video enriched with destination metadata.
 * This is the shape used by the Destinations (video-first) pages.
 */
export type TaggedYouTubeVideo = YouTubeVideo & {
  countrySlug: string;
  regionSlug: string;
};

function extractHashtags(text: string): string[] {
  // Robust hashtag extraction for YouTube descriptions.
  // - Supports normal '#' and fullwidth '＃'
  // - Captures until whitespace
  // - Cleans trailing punctuation like ',', '.', ')', ']' etc.
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

function norm(input: string): string {
  // Normalize to a compact, comparable key:
  // - lowercase
  // - strip diacritics
  // - remove non-alphanumerics
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

/**
 * Enrich raw YouTube videos with destination metadata.
 *
 * Phase 1 (video-first Destinations):
 * - We infer the destination from hashtags in title/description.
 * - Convention: the FIRST matching hashtag that corresponds to a known country wins.
 * - Untagged videos are excluded.
 *
 * No hardcoded countries: we build the matcher index from Sanity-seeded countries.
 */
export function withVideoTags(
  videos: YouTubeVideo[],
  destinations: DestinationForVideoTagging[],
): TaggedYouTubeVideo[] {
  // Build an alias index from destinations so hashtags like:
  // #CostaRica, #costa-rica, #Costa_Rica all match the same country.
  const index = new Map<string, { countrySlug: string; regionSlug: string }>();

  for (const d of destinations) {
    const slug = (d.slug ?? '').trim();
    const title = (d.title ?? '').trim();
    if (!slug) continue;

    const regionSlug = (d.regionSlug ?? 'other').trim() || 'other';

    // Common aliases:
    // - slug forms (costa-rica)
    // - slug compact (costarica)
    // - title forms (Costa Rica -> costarica)
    const aliases = new Set<string>();
    aliases.add(norm(slug));
    aliases.add(norm(slug.replace(/-/g, '')));
    if (title) aliases.add(norm(title));

    for (const a of aliases) {
      if (!a) continue;
      // First wins, deterministic.
      if (!index.has(a)) index.set(a, { countrySlug: slug, regionSlug });
    }
  }

  const tagged: TaggedYouTubeVideo[] = [];

  for (const v of videos) {
    const hashtags = extractHashtags(`${v.title ?? ''}\n${v.description ?? ''}`);

    let match: { countrySlug: string; regionSlug: string } | null = null;
    for (const h of hashtags) {
      const key = norm(h);
      if (!key) continue;
      const hit = index.get(key);
      if (hit) {
        match = hit;
        break;
      }
    }

    if (!match) continue;

    tagged.push({
      ...v,
      countrySlug: match.countrySlug,
      regionSlug: match.regionSlug,
    });
  }

  return tagged;
}
