import { NextResponse } from 'next/server';

import { safeLang, type Lang } from '@/lib/route';
import { getLatestRegularVideos } from '@/lib/youtube/youtube';

export const runtime = 'nodejs';
// Optional: cache for 10 minutes on the server
export const revalidate = 600;

type RouteContext = {
  params?: {
    lang?: Lang;
  };
};

export async function GET(_: Request, { params }: RouteContext) {
  const lang = safeLang(params?.lang);
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
