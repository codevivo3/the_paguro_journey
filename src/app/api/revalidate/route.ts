import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

const SUPPORTED_LANGS = ['it', 'en'] as const;

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');

  if (!secret || secret !== process.env.SANITY_REVALIDATE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  // Sanity webhook will send JSON
  const payload = await req.json().catch(() => ({}) as any);

  const type = payload?._type;
  const slug = payload?.slug?.current ?? payload?.slug ?? null;

  // Always refresh blog listing + home when content changes
  for (const lang of SUPPORTED_LANGS) {
    revalidatePath(`/${lang}`); // homepage
    revalidatePath(`/${lang}/blog`); // blog index/list page

    // Refresh a specific post page if we know the slug
    if (type === 'post' && slug) {
      revalidatePath(`/${lang}/blog/${slug}`);
    }
  }

  return NextResponse.json({ ok: true, type, slug });
}
