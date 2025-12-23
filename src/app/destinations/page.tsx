import Link from 'next/link';

// Placeholder data — later this can come from Sanity.
// (Or you can derive it from videos/posts once YouTube + CMS are wired.)
const destinations = [
  {
    slug: 'thailand',
    title: 'Thailand',
    subtitle: 'Slow travel, islands, and mindful routes.',
    tag: 'Asia',
  },
  {
    slug: 'greece',
    title: 'Greece',
    subtitle: 'Quiet islands, local life, and off-season escapes.',
    tag: 'Europe',
  },
  {
    slug: 'italy',
    title: 'Italy',
    subtitle: 'Small towns, rail journeys, and simple food.',
    tag: 'Europe',
  },
];

export default function DestinationsPage() {
  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page header */}
        <header className='text-center space-y-3'>
          <h1 className='[font-family:var(--font-ui)] text-4xl font-semibold text-[color:var(--paguro-text-dark)]'>
            Destinations
          </h1>
          <p className='mx-auto max-w-2xl text-[color:var(--paguro-text-dark)]/75'>
            A simple map of places we’ve explored — with stories, videos, and practical notes.
          </p>
        </header>

        {/* Filters (placeholder) */}
        <section aria-label='Filters' className='flex flex-wrap items-center justify-center gap-3'>
          <span className='text-sm text-[color:var(--paguro-text-dark)]/60'>
            Filters (later):
          </span>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
          >
            Continent
          </button>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
          >
            Country
          </button>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
          >
            Travel Style
          </button>
        </section>

        {/* Destinations grid */}
        <section aria-label='Destinations' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
              Browse
            </h2>
            <span className='text-sm text-[color:var(--paguro-text-dark)]/60'>
              {destinations.length} destinations
            </span>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {destinations.map((d) => (
              <article
                key={d.slug}
                className='group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
              >
                {/* Image placeholder (later: cover image per destination) */}
                <div className='aspect-video w-full bg-black/10' aria-hidden='true' />

                <div className='p-6 space-y-3'>
                  <div className='flex items-center justify-between gap-4'>
                    <h3 className='[font-family:var(--font-ui)] text-xl font-semibold text-[color:var(--paguro-text-dark)]'>
                      {d.title}
                    </h3>
                    <span className='rounded-full bg-black/5 px-3 py-1 text-xs text-[color:var(--paguro-text-dark)]/70'>
                      {d.tag}
                    </span>
                  </div>

                  <p className='text-[color:var(--paguro-text-dark)]/75'>
                    {d.subtitle}
                  </p>

                  <div className='pt-2'>
                    <Link
                      href='#'
                      className='inline-flex items-center gap-2 text-[color:var(--paguro-deep)] font-medium transition-colors duration-200 group-hover:text-[color:var(--paguro-coral)]'
                      aria-label={`Open destination: ${d.title}`}
                    >
                      Explore <span aria-hidden='true'>➜</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Note (keep it honest while the feature is evolving) */}
        <section className='mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/60 p-6 text-[color:var(--paguro-text-dark)]/75'>
          <p className='[font-family:var(--font-ui)] font-semibold text-[color:var(--paguro-text-dark)]'>
            How this page will evolve
          </p>
          <p className='mt-2'>
            We’ll start small: a clean list of destinations. Later we can add destination pages (with a map, linked videos,
            and related blog posts), plus filters and search.
          </p>
        </section>
      </div>
    </main>
  );
}