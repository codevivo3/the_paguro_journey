import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  (await draftMode()).disable();
  return NextResponse.redirect(new URL('/', req.url));
}
