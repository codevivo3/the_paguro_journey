

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
  sanity: {
    items: Awaited<ReturnType<typeof searchContent>>['items'];
    total: number;
  };
  youtube: {
    items: YouTubeItem[];
    total: number;
  };
};

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
}): Promise<{ items: YouTubeItem[]; total: number }> {
  const key = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!key || !channelId) {
    // YouTube is optional; if env vars are missing, fail soft.
    return { items: [], total: 0 };
  }

  const limit = Math.min(10, Math.max(1, args.limit ?? 6));

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
    return { items: [], total: 0 };
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
          medium?: { url?: string };
          default?: { url?: string };
          high?: { url?: string };
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

  return {
    items,
    total: data.pageInfo?.totalResults ?? items.length,
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawQ = searchParams.get('q') ?? '';
  const q = normalizeQ(rawQ);

  // Guardrails (your preference): min 3 chars.
  if (q.length > 0 && q.length < 3) {
    return NextResponse.json(
      {
        q,
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
      searchContent({ q, limit: 8 }),
      searchYouTube({ q, limit: 6 }),
    ]);

    return NextResponse.json(
      {
        q,
        sanity: {
          items: sanityRes.items,
          total: sanityRes.total,
        },
        youtube: {
          items: ytRes.items,
          total: ytRes.total,
        },
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