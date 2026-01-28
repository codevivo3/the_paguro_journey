/**
 * YouTube Data API helpers (server-side)
 */

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

/* -------------------------------------------------------------------------- */
/* Utils                                                                      */
/* -------------------------------------------------------------------------- */

async function yt<T>(url: string): Promise<T> {
  const res = await fetch(url, { next: { revalidate: 60 * 30 } });

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
      return collected.slice(0, safeLimit);
    }

    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }

  return collected.slice(0, safeLimit);
}

export async function getLatestRegularVideos(limit: number) {
  return getLatestVideos(limit, { excludeShorts: true });
}
