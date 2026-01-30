import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (secret !== process.env.SANITY_PREVIEW_SECRET) {
    return new NextResponse('Invalid secret', { status: 401 });
  }

  if (!slug) {
    return new NextResponse('Missing slug', { status: 400 });
  }

  const dm = await draftMode();
  dm.enable();

  return NextResponse.redirect(new URL(`/blog/${slug}`, request.url));
}
