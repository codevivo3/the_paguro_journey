import type { Metadata } from 'next';

import { searchContent } from '@/sanity/queries/search';

type SearchParams = Promise<{ q?: string; page?: string }>;

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
    : 'Search posts and destinations on The Paguro Journey.';

  const canonical = q ? `/search?q=${encodeURIComponent(q)}` : '/search';

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    // Internal search result pages are typically not indexed (thin/infinite).
    // Keep follow enabled so crawlers can reach real content.
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

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const q = (sp.q ?? '').trim();
  const page = Number(sp.page ?? '1') || 1;

  const res = await searchContent({ q, page, limit: 12 });

  return (
    <main className='mx-auto max-w-5xl px-6 py-10'>
      <h1 className='t-page-title'>Search</h1>

      {q ? (
        <p className='t-meta mt-3'>Query: “{q}”</p>
      ) : (
        <p className='t-body mt-3'>
          Type a query using the search icon to see results.
        </p>
      )}

      {q ? (
        <p className='t-body mt-2'>
          {res.total ? `${res.total} result(s)` : 'No results'}
        </p>
      ) : null}

      {q ? (
        <div className='mt-8 grid gap-6 md:grid-cols-2'>
          {res.items.map((item) => (
            <article key={item._id} className='rounded-md border p-4'>
              <div className='t-meta'>{item._type}</div>
              <div className='t-h3 mt-1'>{item.title}</div>
              {item.excerpt ? (
                <p className='t-body mt-2'>{item.excerpt}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </main>
  );
}
