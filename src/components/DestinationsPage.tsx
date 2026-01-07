// Destination PAge Alternate Version 

import { getDestinationsFromPosts } from '@/lib/posts';
import Image from 'next/image';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardPill,
  CardMetaRow,
} from '@/components/ui/Card';

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
              <Card
                key={d.countrySlug}
                href={`/destinations/${d.countrySlug}`}
                ariaLabel={`Apri destinazione: ${d.country}`}
              >
                <CardMedia className='aspect-video'>
                  <Image
                    src={d.coverImage ?? '/world-placeholder.png'}
                    alt={d.country}
                    fill
                    sizes='(max-width: 1024px) 100vw, 33vw'
                    className='object-cover'
                  />
                </CardMedia>

                <CardBody>
                  <CardMetaRow className='mb-2'>
                    <CardTitle>{d.country}</CardTitle>
                    <CardPill>{d.region}</CardPill>
                  </CardMetaRow>

                  <p className='t-meta'>Blog {d.count}</p>

                  {/* Visual CTA only — the whole card is clickable via Card href */}
                  <div className='mt-auto pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]'>
                    Scopri di più <span aria-hidden>➜</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* Note (keep it honest while the feature is evolving) */}
        <section className='mx-auto max-w-3xl rounded-2xl border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)]/70 p-6 text-[color:var(--paguro-text)]'>
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
