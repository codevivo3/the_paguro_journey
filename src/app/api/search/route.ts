import { NextResponse } from 'next/server';

import { searchContent } from '@/sanity/queries/search';

type YouTubeItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  channelTitle?: string;
};

type ApiResponse = {
  q: string;
  lang: 'it' | 'en';
  sanity: {
    items: Awaited<ReturnType<typeof searchContent>>['items'];
    total: number;
  };
  youtube: {
    items: YouTubeItem[];
    total: number;
  };
  // Helpful during debugging / observability. Present only when YouTube search fails.
  youtubeError?: string;
};

// --- Simple in-memory cache for YouTube results (per server instance) ---
// NOTE: In serverless/edge environments this cache is best-effort (per instance, may reset).
const YT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const ytCache = new Map<string, { expiresAt: number; value: { items: YouTubeItem[]; total: number } }>();

function ytCacheKey(q: string, limit: number) {
  return `${q.toLowerCase()}::${limit}`;
}

function ytCacheGet(key: string) {
  const hit = ytCache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    ytCache.delete(key);
    return null;
  }
  return hit.value;
}

function ytCacheSet(key: string, value: { items: YouTubeItem[]; total: number }) {
  ytCache.set(key, { expiresAt: Date.now() + YT_CACHE_TTL_MS, value });
  // Basic bound to avoid unbounded growth in long-running processes.
  // Keep the most recent ~200 entries.
  if (ytCache.size > 200) {
    const firstKey = ytCache.keys().next().value as string | undefined;
    if (firstKey) ytCache.delete(firstKey);
  }
}

function normalizeQ(input: string) {
  return input.trim();
}

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        // Don't cache errors.
        'cache-control': 'no-store',
      },
    },
  );
}

async function searchYouTube(args: {
  q: string;
  limit?: number;
}): Promise<{ items: YouTubeItem[]; total: number; youtubeError?: string }> {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) {
    // YouTube is optional; if env vars are missing, fail soft but report why.
    const missing = [!key ? 'YOUTUBE_API_KEY' : null, !channelId ? 'YOUTUBE_CHANNEL_ID' : null]
      .filter(Boolean)
      .join(', ');
    return { items: [], total: 0, youtubeError: `Missing env var(s): ${missing}` };
  }

  const limit = Math.min(24, Math.max(1, args.limit ?? 6));
  const cacheKey = ytCacheKey(args.q, limit);
  const cached = ytCacheGet(cacheKey);
  if (cached) {
    return { ...cached };
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('type', 'video');
  url.searchParams.set('maxResults', String(limit));
  url.searchParams.set('q', args.q);
  url.searchParams.set('channelId', channelId);
  // Most relevant first.
  url.searchParams.set('order', 'relevance');
  url.searchParams.set('key', key);

  const res = await fetch(url.toString(), {
    // Avoid caching during development.
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache',
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    // Fail soft: don't break site search because YouTube had an issue.
    let body = '';
    try {
      body = await res.text();
    } catch {
      body = '';
    }

    const msg = `YouTube API error ${res.status} ${res.statusText}${body ? `: ${body.slice(0, 400)}` : ''}`;
    // Server-side visibility
    console.error(msg);

    return { items: [], total: 0, youtubeError: msg };
  }

  const data = (await res.json()) as {
    pageInfo?: { totalResults?: number };
    items?: Array<{
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        publishedAt?: string;
        channelTitle?: string;
        thumbnails?: {
          default?: { url?: string };
          medium?: { url?: string };
          high?: { url?: string };
          standard?: { url?: string };
          maxres?: { url?: string };
        };
      };
    }>;
  };

  const items: YouTubeItem[] = (data.items ?? [])
    .map((it) => {
      const videoId = it.id?.videoId;
      if (!videoId) return null;

      const title = it.snippet?.title ?? 'Video';
      const publishedAt = it.snippet?.publishedAt;
      const channelTitle = it.snippet?.channelTitle;
      const thumbnailUrl =
        it.snippet?.thumbnails?.maxres?.url ??
        it.snippet?.thumbnails?.standard?.url ??
        it.snippet?.thumbnails?.high?.url ??
        it.snippet?.thumbnails?.medium?.url ??
        it.snippet?.thumbnails?.default?.url;

      return {
        id: videoId,
        title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl,
        publishedAt,
        channelTitle,
      };
    })
    .filter(Boolean) as YouTubeItem[];

  const result = {
    items,
    total: data.pageInfo?.totalResults ?? items.length,
  };

  ytCacheSet(cacheKey, result);

  return result;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get('q') ?? '';
  const q = normalizeQ(rawQ);
  const yt = searchParams.get('yt');
  const ytLimit = yt === 'all' ? 24 : 6;

  const sanity = searchParams.get('sanity');
  const sanityLimit = sanity === 'all' ? 24 : 8;

  const pageParam = searchParams.get('page');
  const page = Math.max(1, Number(pageParam ?? '1') || 1);

  const langParam = searchParams.get('lang');
  const lang = langParam === 'en' ? 'en' : 'it';

  // Guardrails (your preference): min 3 chars.
  if (q.length > 0 && q.length < 3) {
    return NextResponse.json(
      {
        q,
        lang,
        sanity: { items: [], total: 0 },
        youtube: { items: [], total: 0 },
      } satisfies ApiResponse,
      {
        status: 200,
        headers: {
          // Don't cache partial queries.
          'cache-control': 'no-store',
        },
      },
    );
  }

  // If empty query, return empty payload (avoid unnecessary work).
  if (!q) {
    return NextResponse.json(
      {
        q: '',
        lang,
        sanity: { items: [], total: 0 },
        youtube: { items: [], total: 0 },
      } satisfies ApiResponse,
      {
        status: 200,
        headers: {
          'cache-control': 'no-store',
        },
      },
    );
  }

  const isDev = process.env.NODE_ENV === 'development';

  try {
    const [sanityRes, ytRes] = await Promise.all([
      searchContent({ q, page, limit: sanityLimit, lang }),
      searchYouTube({ q, limit: ytLimit }),
    ]);

    return NextResponse.json(
      {
        q,
        lang,
        sanity: {
          items: sanityRes.items,
          total: sanityRes.total,
        },
        youtube: {
          items: ytRes.items,
          total: ytRes.total,
        },
        ...(ytRes.youtubeError ? { youtubeError: ytRes.youtubeError } : {}),
      } satisfies ApiResponse,
      {
        status: 200,
        headers: {
          // Keep it snappy but safe: don't cache in dev, short cache in prod.
          'cache-control': isDev
            ? 'no-store'
            : 'public, s-maxage=60, stale-while-revalidate=60',
        },
      },
    );
  } catch (err) {
    // Hard fail is only for our own search pipeline.
    return jsonError('Search failed', 500);
  }
}