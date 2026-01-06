import Link from 'next/link';
import Image from 'next/image';
import { getDestinationsFromPosts } from '@/lib/posts';

const destinations = getDestinationsFromPosts();

export default function DestinationsPage() {
  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Destinazioni</h1>
          <p className='t-page-subtitle'>
            Una mappa semplice dei luoghi che abbiamo esplorato — tra storie,
            video e appunti pratici.
          </p>
        </header>

        {/* Filters (placeholder) */}
        <section
          aria-label='Filters'
          className='flex flex-wrap items-center justify-center gap-3'
        >
          <span className='text-sm text-[color:var(--paguro-text)]/60'>
            Filtri (in arrivo):
          </span>
          <button
            type='button'
            className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'
          >
            Continente
          </button>
          <button
            type='button'
            className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'
          >
            Paese
          </button>
          <button
            type='button'
            className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'
          >
            Stile di viaggio
          </button>
        </section>

        {/* Destinations grid */}
        <section aria-label='Destinations' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>{destinations.length} destinazioni</span>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {destinations.map((d) => (
              <article
                key={d.countrySlug}
                className='group flex flex-col overflow-hidden rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
              >
                <div className='relative aspect-video w-full'>
                  <Image
                    fill
                    src={d.coverImage || '/world-placeholder.png'}
                    alt=''
                    sizes='(max-width: 1024px) 100vw, 33vw'
                    className='object-cover'
                  />
                </div>
                <div className='flex flex-1 flex-col p-6'>
                  <div className='flex items-center justify-between gap-4'>
                    <h3 className='t-card-title'>{d.country}</h3>
                    <span className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'>
                      {d.region}
                    </span>
                  </div>

                  <p className='t-meta'>Blog {d.count}</p>

                  <div className='mt-auto pt-4'>
                    <Link
                      href={`/destinations/${d.countrySlug}`}
                      className='inline-flex items-center gap-2 font-medium transition-colors duration-200 text-sm text-[color:var(--paguro-text)] hover:text-[color:var(--paguro-coral)]'
                      aria-label={`Open destination: ${d.country}`}
                    >
                      Scopri di più <span aria-hidden='true'>➜</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Note (keep it honest while the feature is evolving) */}
        <section className='mx-auto max-w-3xl rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)]/70 p-6 text-[color:var(--paguro-text)]'>
          <p className='t-card-title'>Come evolverà questa pagina</p>
          <p className='mt-2'>
            Inizieremo in modo semplice: una lista pulita delle destinazioni. In
            seguito potremo aggiungere pagine dedicate a ciascun luogo (con
            mappa, video collegati e articoli correlati), oltre a filtri e
            ricerca.
          </p>
        </section>
      </div>
    </main>
  );
}
