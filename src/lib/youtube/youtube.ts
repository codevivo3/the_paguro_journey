/**
 * YouTube Data API helpers (server-side)
 */

import type { Lang } from '@/lib/route';

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!API_KEY) {
  throw new Error('Missing env var YOUTUBE_API_KEY');
}

if (!CHANNEL_ID) {
  throw new Error('Missing env var YOUTUBE_CHANNEL_ID');
}

const YT_API_KEY: string = API_KEY;
const YT_CHANNEL_ID: string = CHANNEL_ID;

/* -------------------------------------------------------------------------- */
/* Config                                                                     */
/* -------------------------------------------------------------------------- */

// Cache policy:
// - This site does not need real-time YouTube data.
// - The channel publishes roughly monthly.
// - A 24h cache keeps quota usage tiny and avoids refetching on every request.
// If you ever need fresher data, lower this value (in seconds).
const YT_REVALIDATE_SECONDS = 60 * 60 * 24; // 24h

// YouTube Data API limits:
// - videos.list supports max 50 ids per request.
// - We cap the maximum amount we resolve per call to stay quota-friendly.
const YT_MAX_IDS_PER_REQUEST = 50;
const YT_MAX_TOTAL_IDS = 150; // => 3 requests max

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  href: string;
  thumbnail: string;
  publishedAt: string;
};

type ChannelsResponse = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type PlaylistItem = {
  snippet?: {
    title?: string;
    description?: string;
    publishedAt?: string;
  };
  contentDetails?: {
    videoId?: string;
  };
};

type PlaylistItemsResponse = {
  items?: PlaylistItem[];
  nextPageToken?: string;
};

type YouTubeVideoDetailsItem = {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    localized?: {
      title?: string;
      description?: string;
    };
  };
  localizations?: Record<
    string,
    {
      title?: string;
      description?: string;
    }
  >;
};

type VideosResponse = {
  items?: YouTubeVideoDetailsItem[];
};

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

async function yt<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: YT_REVALIDATE_SECONDS } });

  if (!res.ok) {
    throw new Error(`YouTube API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

function isShortLike(v: Pick<YouTubeVideo, 'title' | 'description'>): boolean {
  return (
    /#shorts/i.test(v.title) ||
    /#shorts/i.test(v.description) ||
    /\bshorts\b/i.test(v.title) ||
    /\bshort\b/i.test(v.title) ||
    /#short/i.test(v.title) ||
    /#short/i.test(v.description)
  );
}

function cleanDescription(input: string): string {
  // Basic cleanup: keep content readable, avoid huge whitespace blocks.
  return (input ?? '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function pickLocalizedText(args: {
  lang: Lang;
  snippetTitle?: string;
  snippetDescription?: string;
  snippetLocalizedTitle?: string;
  snippetLocalizedDescription?: string;
  localizations?: Record<string, { title?: string; description?: string }>;
}): { title: string; description: string } {
  const { lang, snippetTitle, snippetDescription, snippetLocalizedTitle, snippetLocalizedDescription, localizations } =
    args;

  const loc = localizations?.[lang];

  const title =
    loc?.title ??
    snippetLocalizedTitle ??
    snippetTitle ??
    'Untitled';

  const description =
    loc?.description ??
    snippetLocalizedDescription ??
    snippetDescription ??
    '';

  return { title, description: cleanDescription(description) };
}

async function getVideoDetailsByIds(
  ids: string[],
  lang: Lang,
): Promise<Map<string, { title: string; description: string }>> {
  const safeIds = Array.from(new Set((ids ?? []).filter(Boolean)));
  if (safeIds.length === 0) return new Map();

  // YouTube Data API limit: max 50 IDs per request.
  // We chunk to avoid extra requests in typical usage, but still support >50.
  // To be quota-friendly, we cap the maximum number of IDs resolved per call.
  const cappedIds = safeIds.slice(0, YT_MAX_TOTAL_IDS);

  const chunks: string[][] = [];
  for (let i = 0; i < cappedIds.length; i += YT_MAX_IDS_PER_REQUEST) {
    chunks.push(cappedIds.slice(i, i + YT_MAX_IDS_PER_REQUEST));
  }

  const out = new Map<string, { title: string; description: string }>();

  for (const chunk of chunks) {
    const url: string =
      `https://www.googleapis.com/youtube/v3/videos` +
      `?part=snippet,localizations` +
      `&id=${encodeURIComponent(chunk.join(','))}` +
      `&hl=${encodeURIComponent(lang)}` +
      `&key=${encodeURIComponent(YT_API_KEY)}`;

    const data: VideosResponse = await yt(url);

    for (const item of data.items ?? []) {
      const id = item.id;
      if (!id) continue;

      const snippet = item.snippet;

      const picked = pickLocalizedText({
        lang,
        snippetTitle: snippet?.title,
        snippetDescription: snippet?.description,
        snippetLocalizedTitle: snippet?.localized?.title,
        snippetLocalizedDescription: snippet?.localized?.description,
        localizations: item.localizations,
      });

      out.set(id, picked);
    }
  }

  return out;
}

/* -------------------------------------------------------------------------- */
/* API                                                                        */
/* -------------------------------------------------------------------------- */

export async function getUploadsPlaylistId(): Promise<string> {
  const url: string =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=contentDetails` +
    `&id=${encodeURIComponent(YT_CHANNEL_ID)}` +
    `&key=${encodeURIComponent(YT_API_KEY)}`;

  const data: ChannelsResponse = await yt(url);

  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploads) throw new Error('Uploads playlist not found');

  return uploads;
}

type GetLatestVideosOptions = {
  lang?: Lang;
  excludeShorts?: boolean;
  pageSize?: number;
  maxPages?: number;
};

export async function getLatestVideos(
  limit: number,
  options: GetLatestVideosOptions = {}
): Promise<YouTubeVideo[]> {
  const uploadsId = await getUploadsPlaylistId();

  const safeLimit = Math.max(1, limit);
  const lang = options.lang ?? 'it';
  const excludeShorts = options.excludeShorts ?? false;
  const pageSize = Math.min(50, options.pageSize ?? safeLimit * 3);
  const maxPages = options.maxPages ?? 5;

  let pageToken: string | undefined;
  const collected: YouTubeVideo[] = [];

  for (let page = 0; page < maxPages; page++) {
    const url: string =
      `https://www.googleapis.com/youtube/v3/playlistItems` +
      `?part=snippet,contentDetails` +
      `&playlistId=${encodeURIComponent(uploadsId)}` +
      `&maxResults=${pageSize}` +
      (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '') +
      `&key=${encodeURIComponent(YT_API_KEY)}`;

    const data: PlaylistItemsResponse = await yt(url);

    const items = data.items ?? [];

    const normalized: YouTubeVideo[] = items
      .map((item): YouTubeVideo | null => {
        const videoId = item.contentDetails?.videoId;
        if (!videoId) return null;

        return {
          id: videoId,
          title: item.snippet?.title ?? 'Untitled',
          description: item.snippet?.description ?? '',
          publishedAt: item.snippet?.publishedAt ?? '',
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          href: `https://www.youtube.com/watch?v=${videoId}`,
        };
      })
      .filter((v): v is YouTubeVideo => Boolean(v));

    const filtered = excludeShorts
      ? normalized.filter((v) => !isShortLike(v))
      : normalized;

    collected.push(...filtered);

    if (collected.length >= safeLimit) {
      // We have enough videos; stop paging and then localize titles/descriptions
      // via the second videos.list call below.
      break;
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  const finalList = collected.slice(0, safeLimit);

  // Why a second API call?
  // playlistItems.snippet is not reliably localized. videos.list provides `snippet.localized`
  // and `localizations[lang]` when creators have set translations in YouTube Studio.
  // We prefer YouTube-provided translations (free) and fall back gracefully.
  const detailsById = await getVideoDetailsByIds(
    finalList.map((v) => v.id),
    lang,
  );

  const merged = finalList.map((v) => {
    const d = detailsById.get(v.id);
    if (!d) return v;

    return {
      ...v,
      title: d.title,
      description: d.description,
    };
  });

  return merged;
}

export async function getLatestRegularVideos(
  limit: number,
  options: Omit<GetLatestVideosOptions, 'excludeShorts'> = {},
): Promise<YouTubeVideo[]> {
  return getLatestVideos(limit, { ...options, excludeShorts: true });
}
