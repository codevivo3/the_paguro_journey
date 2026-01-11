/**
 * YouTube Data API helpers (server-side)
 *
 * Purpose:
 * - Centralize YouTube fetching + response normalization
 * - Keep UI components clean: they consume `YouTubeVideo[]`
 *
 * Notes:
 * - This module should remain `.ts` (no JSX here).
 * - Uses Next.js fetch caching via `revalidate`.
 */

const API_KEY = process.env.YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID;

if (!API_KEY) {
  throw new Error(
    'Missing env var YOUTUBE_API_KEY. Add it to .env.local (and restart dev server).'
  );
}

if (!CHANNEL_ID) {
  throw new Error(
    'Missing env var YOUTUBE_CHANNEL_ID. Add it to .env.local (and restart dev server).'
  );
}

// From here, TS knows they are strings *if you create narrowed aliases*:
const YT_API_KEY: string = API_KEY;
const YT_CHANNEL_ID: string = CHANNEL_ID;

/** Normalized shape consumed by the UI */
export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  /** Canonical watch URL */
  href: string;
  /** Best available thumbnail */
  thumbnail: string;
  /** ISO date string */
  publishedAt: string;
};

// -----------------------------
// Internal API response types
// -----------------------------

type ChannelsResponse = {
  items?: Array<{
    contentDetails?: {
      relatedPlaylists?: {
        uploads?: string;
      };
    };
  }>;
};

type PlaylistItemsResponse = {
  items?: Array<{
    snippet?: {
      title?: string;
      description?: string;
      publishedAt?: string;
      thumbnails?: {
        high?: { url?: string };
        medium?: { url?: string };
        default?: { url?: string };
      };
    };
    contentDetails?: {
      videoId?: string;
    };
  }>;
};

/**
 * Small wrapper around fetch + JSON parsing.
 * - Caches results for 30 minutes on the server.
 * - Throws a readable error when the API fails.
 */
async function yt<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 * 30 } }); // cache 30 min

  if (!res.ok) {
    // Try to include the JSON error from Google for easier debugging.
    let details = '';
    try {
      const body = await res.json();
      details = `\n${JSON.stringify(body, null, 2)}`;
    } catch {
      // ignore
    }

    throw new Error(`YouTube API error: ${res.status} ${res.statusText}${details}`);
  }

  return (await res.json()) as T;
}

/**
 * Fetches the channel's uploads playlist id.
 * YouTube stores all uploads in a special playlist.
 */
export async function getUploadsPlaylistId(): Promise<string> {
  const url =
    `https://www.googleapis.com/youtube/v3/channels` +
    `?part=contentDetails` +
    `&id=${encodeURIComponent(YT_CHANNEL_ID)}` +
    `&key=${encodeURIComponent(YT_API_KEY)}`;

  const data = await yt<ChannelsResponse>(url);

  const uploads = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

  if (!uploads) {
    throw new Error(
      'Could not resolve uploads playlist id. Check YOUTUBE_CHANNEL_ID and API permissions.'
    );
  }

  return uploads;
}

/**
 * Returns the latest `limit` videos from the channel uploads playlist.
 *
 * Tip:
 * - This is public data, so API key is enough (no OAuth needed).
 */
export async function getLatestVideos(limit: number): Promise<YouTubeVideo[]> {
  const uploadsId = await getUploadsPlaylistId();

  // YouTube API maxResults is 1..50
  const maxResults = Math.max(1, Math.min(50, limit));

  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?part=snippet,contentDetails` +
    `&playlistId=${encodeURIComponent(uploadsId)}` +
    `&maxResults=${maxResults}` +
    `&key=${encodeURIComponent(YT_API_KEY)}`;

  const data = await yt<PlaylistItemsResponse>(url);

  return (data.items ?? [])
    .map((item): YouTubeVideo | null => {
      const videoId = item.contentDetails?.videoId;
      if (!videoId) return null;

      const snippet = item.snippet;

      const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

      return {
        id: videoId,
        title: snippet?.title ?? 'Untitled',
        description: snippet?.description ?? '',
        thumbnail,
        publishedAt: snippet?.publishedAt ?? '',
        href: `https://www.youtube.com/watch?v=${videoId}`,
      };
    })
    .filter((v): v is YouTubeVideo => Boolean(v));
}