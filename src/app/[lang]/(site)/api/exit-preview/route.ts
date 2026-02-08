import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  (await draftMode()).disable();

  const { searchParams } = new URL(req.url);
  const redirect = searchParams.get('redirect');
  const safeRedirect = redirect && redirect.startsWith('/') ? redirect : '/';

  return NextResponse.redirect(new URL(safeRedirect, req.url));
}
