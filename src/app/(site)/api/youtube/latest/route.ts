import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
// Optional: cache for 10 minutes on the server
export const revalidate = 600;

type YouTubeItem = {
  id: { videoId?: string };
  snippet: {
    title: string;
    description: string;
    thumbnails?: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
      standard?: { url: string; width: number; height: number };
      maxres?: { url: string; width: number; height: number };
    };
    publishedAt?: string;
  };
};

export async function GET() {
  const key = process.env.YOUTUBE_API_KEY;

  if (!key) {
    return NextResponse.json(
      { error: 'Missing YOUTUBE_API_KEY in environment variables.' },
      { status: 500 },
    );
  }

  // ✅ For now we use channelId as a placeholder.
  // Replace this with Paguro’s channelId when you have it.
  const channelId = process.env.YOUTUBE_CHANNEL_ID ?? '';
  if (!channelId) {
    return NextResponse.json(
      {
        error:
          'Missing YOUTUBE_CHANNEL_ID. Add it to .env.local (temporary) or hardcode it for testing.',
      },
      { status: 500 },
    );
  }

  const maxResults = 6;

  const url =
    `https://www.googleapis.com/youtube/v3/search` +
    `?part=snippet` +
    `&channelId=${encodeURIComponent(channelId)}` +
    `&maxResults=${maxResults}` +
    `&order=date` +
    `&type=video` +
    `&key=${encodeURIComponent(key)}`;

  try {
    const res = await fetch(url, {
      // Next will cache this because of revalidate above
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        {
          error: 'YouTube API request failed',
          status: res.status,
          details: text,
        },
        { status: 502 },
      );
    }

    const data = (await res.json()) as { items?: YouTubeItem[] };
    const items = data.items ?? [];

    // Normalize to the shape you want your UI to consume
    const videos = items
      .filter((it) => it.id?.videoId)
      .map((it) => {
        const videoId = it.id.videoId!;
        const thumb =
          it.snippet.thumbnails?.maxres?.url ??
          it.snippet.thumbnails?.standard?.url ??
          it.snippet.thumbnails?.high?.url ??
          it.snippet.thumbnails?.medium?.url ??
          '';

        return {
          id: videoId,
          title: it.snippet.title,
          description: it.snippet.description,
          thumbnail: thumb,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          publishedAt: it.snippet.publishedAt ?? null,
        };
      });

    return NextResponse.json({ videos });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error while calling YouTube API', details: String(err) },
      { status: 500 },
    );
  }
}
