import { NextResponse, type NextRequest } from 'next/server';

import { safeLang, type Lang } from '@/lib/route';
import { getLatestRegularVideos } from '@/lib/youtube/youtube';

export const runtime = 'nodejs';
// Optional: cache for 10 minutes on the server
export const revalidate = 600;


export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ lang: string }> },
) {
  const { lang: rawLang } = await params;
  const lang = safeLang(rawLang as Lang);
  const limit = 6;

  try {
    const videos = await getLatestRegularVideos(limit, { lang });

    return NextResponse.json({
      videos: videos.map((video) => ({
        id: video.id,
        title: video.title,
        description: video.description,
        thumbnail: video.thumbnail,
        url: video.href,
        publishedAt: video.publishedAt ?? null,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Server error while calling YouTube API', details: String(err) },
      { status: 500 },
    );
  }
}
