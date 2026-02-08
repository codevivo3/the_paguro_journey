import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const slug = searchParams.get('slug');

  if (!secret || secret !== process.env.PREVIEW_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  if (!slug || !slug.startsWith('/')) {
    return NextResponse.json({ message: 'Invalid slug' }, { status: 400 });
  }

  // Enable Draft Mode (sets cookies)
  (await draftMode()).enable();

  // Redirect to the page
  return NextResponse.redirect(new URL(slug, req.url));
}
