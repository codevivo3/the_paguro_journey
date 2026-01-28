import { NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const runtime = 'nodejs';

/**
 * Revalidation endpoint (avoids Vercel redeploys).
 *
 * Use from Sanity Webhooks to refresh ISR/Route Cache.
 *
 * Auth:
 * - Provide `?secret=...` OR header `x-revalidate-secret: ...`
 * - Set env `REVALIDATE_SECRET`
 *
 * Payload (Sanity webhook):
 * - Any JSON is accepted.
 * - If it includes `_type` and a `slug` (either `slug.current` or `slug`),
 *   we will revalidate the relevant detail page too.
 */

type JsonObject = Record<string, unknown>;

type SanityWebhookPayload = {
  _type?: unknown;
  type?: unknown;
  slug?: unknown;
  document?: {
    _type?: unknown;
    slug?: unknown;
  };
};

function getSecret(req: Request) {
  const url = new URL(req.url);
  return (
    url.searchParams.get('secret') ||
    req.headers.get('x-revalidate-secret') ||
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ||
    ''
  );
}

function readSlug(payload: SanityWebhookPayload | null): string {
  if (!payload) return '';

  const slug = payload.slug;
  if (typeof slug === 'string') return slug;
  if (slug && typeof slug === 'object') {
    const obj = slug as JsonObject;
    if (typeof obj.current === 'string') return obj.current;
  }

  const docSlug = payload.document?.slug;
  if (typeof docSlug === 'string') return docSlug;
  if (docSlug && typeof docSlug === 'object') {
    const obj = docSlug as JsonObject;
    if (typeof obj.current === 'string') return obj.current;
  }

  return '';
}

function readType(payload: SanityWebhookPayload | null): string {
  if (!payload) return '';

  const t1 = payload._type;
  if (typeof t1 === 'string') return t1;

  const t2 = payload.type;
  if (typeof t2 === 'string') return t2;

  const t3 = payload.document?._type;
  if (typeof t3 === 'string') return t3;

  return '';
}

function pushUnique(arr: string[], value?: string | null) {
  if (!value) return;
  if (!arr.includes(value)) arr.push(value);
}

function pathsForDoc(type: string, slug: string) {
  // NOTE: adjust these if your route segments differ.
  // From your navbar / site copy, these are the likely public paths:
  // - blog: /blog/[slug]
  // - destinations: /destinazioni/[slug]
  const paths: string[] = [];

  // Always revalidate key listing pages + home.
  pushUnique(paths, '/');
  pushUnique(paths, '/blog');
  pushUnique(paths, '/destinazioni');
  pushUnique(paths, '/galleria');
  pushUnique(paths, '/chi-siamo');
  pushUnique(paths, '/contatti');

  if (!slug) return paths;

  if (type === 'post') {
    pushUnique(paths, `/blog/${slug}`);
  }

  if (type === 'destination') {
    pushUnique(paths, `/destinazioni/${slug}`);
  }

  // If your destinations route uses /destinations instead, uncomment this:
  // if (type === 'destination') pushUnique(paths, `/destinations/${slug}`);

  return paths;
}

export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = getSecret(req);

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Missing REVALIDATE_SECRET on server.' },
      { status: 500 },
    );
  }

  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);

  // Manual mode: allow `?path=/something` for one-off invalidations.
  const manualPath = url.searchParams.get('path');

  let payload: SanityWebhookPayload | null = null;
  try {
    // Some webhook providers can send empty bodies. That’s OK.
    payload = (await req.json()) as SanityWebhookPayload;
  } catch {
    payload = null;
  }

  const type = readType(payload);
  const slug = readSlug(payload);

  const paths: string[] = [];
  if (manualPath) pushUnique(paths, manualPath);

  for (const p of pathsForDoc(type, slug)) pushUnique(paths, p);

  // If you ever add `fetch(..., { next: { tags: [...] }})`, you can also
  // revalidate by tag for instant global invalidation.
  // This is harmless even if you don’t use tags yet.
  revalidateTag('sanity', 'page');
  revalidateTag('youtube', 'page');

  for (const p of paths) revalidatePath(p, 'page');

  return NextResponse.json({ ok: true, type: type || null, slug: slug || null, revalidated: paths });
}

// Optional: allow GET for quick browser testing:
// /api/revalidate?secret=...&path=/blog
export async function GET(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = getSecret(req);

  if (!expected) {
    return NextResponse.json(
      { ok: false, error: 'Missing REVALIDATE_SECRET on server.' },
      { status: 500 },
    );
  }

  if (provided !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const path = url.searchParams.get('path') || '/';

  revalidateTag('sanity', 'page');
  revalidateTag('youtube', 'page');
  revalidatePath(path, 'page');

  return NextResponse.json({ ok: true, revalidated: [path] });
}
