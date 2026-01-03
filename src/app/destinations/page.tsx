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
          <span className='text-sm text-[color:var(--paguro-text-dark)]/60'>
            Filtri (in arrivo):
          </span>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
          >
            Continente
          </button>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
          >
            Paese
          </button>
          <button
            type='button'
            className='rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--paguro-text-dark)] shadow-sm'
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
                className='group overflow-hidden rounded-2xl border border-black/10 bg-[color:var(--paguro-ivory)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
              >
                <div className='relative aspect-video w-full bg-black/10'>
                  <Image
                    fill
                    src={d.coverImage || '/world-placeholder.png'}
                    alt=''
                    sizes='(max-width: 1024px) 100vw, 33vw'
                    className='object-cover'
                  />
                </div>
                <div className='p-6 space-y-3'>
                  <div className='flex items-center justify-between gap-4'>
                    <h3 className='t-card-title'>{d.country}</h3>
                    <span className='t-meta rounded-full bg-black/5 px-3 py-1'>
                      {d.region}
                    </span>
                  </div>

                  <p className='t-meta'>Blog {d.count}</p>

                  <div className='pt-2'>
                    <Link
                      href={`/destinations/${d.countrySlug}`}
                      className='inline-flex items-center gap-2 text-[color:var(--paguro-deep)] font-medium transition-colors duration-200 group-hover:text-[color:var(--paguro-coral)]'
                      aria-label={`Open destination: ${d.country}`}
                    >
                      Scopri di piu <span aria-hidden='true'>➜</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Note (keep it honest while the feature is evolving) */}
        <section className='mx-auto max-w-3xl rounded-2xl border border-black/10 bg-white/60 p-6 text-[color:var(--paguro-text-dark)]/75'>
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
