import type { Metadata } from 'next';
import Image from 'next/image';
import { headers } from 'next/headers';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Force dynamic rendering so querystring toggles (e.g. yt=all) update without full refresh.
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// -----------------------------
// Types
// -----------------------------

type SearchParams = Promise<{ q?: string; page?: string; yt?: string }>;

type SearchApiResponse = {
  q: string;
  sanity: {
    items: Array<{
      _id: string;
      _type: 'post' | 'destination';
      title: string;
      slug?: string;
      excerpt?: string;
      coverImageUrl?: string | null;
      // Optional: if the API returns the raw Sanity image field (recommended), we can build URLs via urlFor().
      // Keep this loose to avoid coupling the page to Sanity types.
      coverImage?: SanityImageSource | null;
    }>;
    total: number;
  };
  youtube: {
    items: Array<{
      id: string;
      title: string;
      url: string;
      thumbnailUrl?: string;
      publishedAt?: string;
      channelTitle?: string;
    }>;
    total: number;
  };
};

// -----------------------------
// Metadata (SEO-safe)
// -----------------------------

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const q = (sp.q ?? '').trim();

  const baseTitle = 'Search | The Paguro Journey';
  const title = q ? `Search “${q}” | The Paguro Journey` : baseTitle;

  const description = q
    ? `Search results for “${q}” on The Paguro Journey.`
    : 'Search posts, destinations and videos on The Paguro Journey.';

  const canonical = q ? `/search?q=${encodeURIComponent(q)}` : '/search';

  return {
    title,
    description,
    alternates: { canonical },

    // SEO note:
    // - Pages with a query are thin / infinite → noindex
    // - Keep follow enabled so crawlers can reach real content
    robots: q ? { index: false, follow: true } : { index: true, follow: true },

    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

// -----------------------------
// Page
// -----------------------------

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? '').trim();
  const page = Number(sp.page ?? '1') || 1;
  const showAllVideos = sp.yt === 'all';

  let data: SearchApiResponse | null = null;

  if (q) {
    const qs = new URLSearchParams();
    qs.set('q', q);
    qs.set('page', String(page));
    if (showAllVideos) qs.set('yt', 'all');

    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000';
    const proto = h.get('x-forwarded-proto') ?? 'http';
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/search?${qs.toString()}`, {
      cache: 'no-store',
    });

    if (res.ok) {
      data = (await res.json()) as SearchApiResponse;
    }
  }

  const sanityItems = data?.sanity.items ?? [];
  const ytAllItems = data?.youtube.items ?? [];
  const ytItems = showAllVideos ? ytAllItems : ytAllItems.slice(0, 6);
  const ytTotal = data?.youtube.total ?? 0;
  const total = (data?.sanity.total ?? 0) + ytTotal;

  return (
    <main className='min-h-screen px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        <header className='space-y-3'>
          <h1 className='t-page-title [font-family:var(--font-ui)]'>Search</h1>
          <p className='t-page-subtitle'>
            {q
              ? `Results for “${q}”.`
              : 'Search posts, destinations and videos from The Paguro Journey.'}
          </p>
        </header>
        <section className='space-y-4'>
          <div className='flex items-baseline justify-between gap-6'>
            <h2 className='t-section-title [font-family:var(--font-ui)]'>
              Blog
              <span className='ml-2 text-sm font-normal opacity-70'>
                ({data?.sanity.total ?? 0})
              </span>
            </h2>
          </div>

          {/* Sanity results */}
          {sanityItems.length ? (
            <div className='grid gap-6 md:grid-cols-2'>
              {sanityItems.map((item) => (
                <article
                  key={item._id}
                  className='rounded-md bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-200 hover:scale-[1.05]'
                >
                  {item._type === 'post' && item.slug ? (
                    <Link
                      href={`/blog/${item.slug}`}
                      className='block rounded-md p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20'
                    >
                      <div className='flex gap-4'>
                        <div className='relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-black/10'>
                          {(() => {
                            let src: string | null = null;

                            if (item.coverImage) {
                              try {
                                src =
                                  urlFor(item.coverImage)
                                    .width(224)
                                    .height(128)
                                    .fit('crop')
                                    .auto('format')
                                    .url() ?? null;
                              } catch {
                                // If Sanity returns a non-image reference (e.g. UUID), fall back to the URL field.
                                src = null;
                              }
                            }

                            if (!src) src = item.coverImageUrl ?? null;

                            return src ? (
                              <Image
                                src={src}
                                alt={item.title}
                                fill
                                sizes='112px'
                                className='object-cover'
                                unoptimized
                              />
                            ) : null;
                          })()}
                        </div>

                        <div className='min-w-0'>
                          <div className='t-meta text-xs'>blog</div>
                          <div className='t-section-title mt-1 text-base [font-family:var(--font-ui)] line-clamp-2'>
                            {item.title}
                          </div>
                          {item.excerpt ? (
                            <p className='t-body text-sm mt-2 line-clamp-2'>
                              {item.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className='rounded-md p-4'>
                      <div className='flex gap-4'>
                        <div className='relative h-16 w-28 shrink-0 overflow-hidden rounded-md bg-black/10'>
                          {(() => {
                            let src: string | null = null;

                            if (item.coverImage) {
                              try {
                                src =
                                  urlFor(item.coverImage)
                                    .width(224)
                                    .height(128)
                                    .fit('crop')
                                    .auto('format')
                                    .url() ?? null;
                              } catch {
                                // If Sanity returns a non-image reference (e.g. UUID), fall back to the URL field.
                                src = null;
                              }
                            }

                            if (!src) src = item.coverImageUrl ?? null;

                            return src ? (
                              <Image
                                src={src}
                                alt={item.title}
                                fill
                                sizes='112px'
                                className='object-cover'
                                unoptimized
                              />
                            ) : null;
                          })()}
                        </div>

                        <div className='min-w-0'>
                          <div className='t-meta text-xs'>{item._type}</div>
                          <div className='t-section-title mt-1 text-base [font-family:var(--font-ui)] line-clamp-2'>
                            {item.title}
                          </div>
                          {item.excerpt ? (
                            <p className='t-body text-sm mt-2 line-clamp-2'>
                              {item.excerpt}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : null}
        </section>

        {/* YouTube results */}
        {ytItems.length ? (
          <section className='space-y-4'>
            <div className='flex items-baseline justify-between gap-6'>
              <h2 className='t-section-title [font-family:var(--font-ui)]'>
                Videos
                <span className='ml-2 text-sm font-normal opacity-70'>
                  ({data?.youtube.total ?? 0})
                </span>
              </h2>
            </div>
            <div className='grid gap-6 md:grid-cols-2'>
              {ytItems.map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target='_blank'
                  rel='noreferrer'
                  className='group flex gap-3 rounded-md p-4 transition-transform duration-200 hover:scale-[1.05] shadow-sm bg-[color:var(--paguro-surface)]'
                >
                  <div className='h-16 w-28 overflow-hidden rounded-md bg-black/10'>
                    {v.thumbnailUrl ? (
                      <Image
                        src={v.thumbnailUrl}
                        alt={v.title}
                        width={112}
                        height={64}
                        className='h-full w-full object-cover scale-[1.15]'
                      />
                    ) : null}
                  </div>

                  <div className='min-w-0'>
                    <div className='t-section-title text-base line-clamp-2 [font-family:var(--font-ui)]'>
                      {v.title}
                    </div>
                    {v.channelTitle ? (
                      <div className='t-body mt-1 text-sm'>
                        {v.channelTitle}
                      </div>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>
            {ytTotal > 6 ? (
              <div className='pt-2'>
                {showAllVideos ? (
                  <Link
                    href={q ? `/search?q=${encodeURIComponent(q)}` : '/search'}
                    className='t-page-title inline-flex items-center gap-2 text-base font-semibold [font-family:var(--font-ui)] text-[color:var(--paguro-deep)] hover:text-[color:var(--paguro-coral)]'
                  >
                    Mostra meno
                    <span aria-hidden>↑</span>
                  </Link>
                ) : (
                  <Link
                    href={
                      q
                        ? `/search?q=${encodeURIComponent(q)}&yt=all`
                        : '/search?yt=all'
                    }
                    className='t-page-title inline-flex items-center gap-2 text-base font-semibold [font-family:var(--font-ui)] text-[color:var(--paguro-deep)] hover:text-[color:var(--paguro-coral)]'
                  >
                    Vedi altri video
                    <span aria-hidden>→</span>
                  </Link>
                )}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
