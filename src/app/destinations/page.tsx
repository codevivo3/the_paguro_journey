import { getDestinationsFromPosts, facts } from '@/lib/posts';
import Image from 'next/image';
import Link from 'next/link';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardMetaRow,
} from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// This page uses a masonry-style layout mixing destination cards and fact cards for visual variety.
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
            video e appunti pratici. <br />{' '}
            <span className='font-extrabold'>Prova in stile mansory.</span>
          </p>
        </header>

        {/* Filters (placeholder) */}
        {/* These filter links are placeholders and will later become real interactive filters */}
        <section
          aria-label='Filters'
          className='flex flex-wrap items-center justify-center gap-3'
        >
          <span className='text-sm text-[color:var(--paguro-text)]/60'>
            Filtri (in arrivo):
          </span>
          <Link
            href={''}
            className='inline-flex items-center justify-center h-10 rounded-3xl border border-white/40 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-white text-sm shadow-sm hover:bg-[color:var(--paguro-coral)]'
          >
            Continente
          </Link>
          <Link
            href={''}
            className='inline-flex items-center justify-center h-10 rounded-3xl border border-white/40 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)]  text-white text-sm shadow-sm hover:bg-[color:var(--paguro-coral)]'
          >
            Paese
          </Link>
          <Link
            href={''}
            className='inline-flex items-center justify-center h-10 rounded-3xl border border-white/40 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-white text-sm shadow-sm hover:bg-[color:var(--paguro-coral)]'
          >
            Stile di viaggio
          </Link>
        </section>

        {/* Destinations grid */}
        <section aria-label='Destinations' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>{destinations.length} destinazioni</span>
          </div>

          {/* This container uses CSS columns to create a masonry-like layout */}
          <div className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
            {(() => {
              // Stream-mixing logic: interleave destination cards with fact cards to create a varied layout.
              const items: Array<
                | {
                    type: 'destination';
                    d: (typeof destinations)[number];
                    index: number;
                  }
                | { type: 'fact'; f: (typeof facts)[number]; index: number }
              > = [];

              // Controls how often fact cards are injected among destination cards.
              const INSERT_EVERY = 3;
              let factCursor = 0;

              destinations.forEach((d, index) => {
                items.push({ type: 'destination', d, index });

                const shouldInsertFact =
                  (index + 1) % INSERT_EVERY === 0 && factCursor < facts.length;

                if (shouldInsertFact) {
                  items.push({ type: 'fact', f: facts[factCursor], index });
                  factCursor += 1;
                }
              });

              return items.map((item, streamIndex) => {
                if (item.type === 'fact') {
                  // Give facts their own "rhythm": sometimes taller
                  const factClass =
                    streamIndex % 7 === 0 ? 'min-h-[18rem]' : 'min-h-[14rem]';

                  return (
                    <div
                      key={`fact-${streamIndex}`}
                      className='break-inside-avoid'
                    >
                      <article
                        className={[
                          'group overflow-hidden rounded-sm border border-[color:var(--paguro-border)]',
                          'bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300',
                          'hover:-translate-y-1 hover:shadow-lg',
                          factClass,
                        ].join(' ')}
                      >
                        <div className='flex flex-col p-6'>
                          <div className='mb-2 flex items-start justify-between gap-4'>
                            <h3 className='t-card-title min-w-0'>
                              {(() => {
                                // Titles are split into two lines to allow an intentional 2-line title (e.g. "Curiosità\nCentro America"),
                                // and the second line uses 'whitespace-nowrap' to prevent wrapping into multiple words.
                                const parts = String(item.f.title).split('\n');
                                const first = parts[0] ?? '';
                                const second = parts.slice(1).join(' ').trim();

                                return (
                                  <>
                                    <span className='block'>{first}</span>
                                    {second ? (
                                      <span className='block whitespace-nowrap'>
                                        {second}
                                      </span>
                                    ) : null}
                                  </>
                                );
                              })()}
                            </h3>

                            <span className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-3xl border border-white/65 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--paguro-coral)]'>
                              {item.f.pill}
                            </span>
                          </div>

                          <p className='t-card-body whitespace-pre-line'>
                            {item.f.text}
                          </p>

                          <div className='mt-auto pt-4 text-sm font-medium text-[color:var(--paguro-link)]'>
                            (mock) <span aria-hidden>✦</span>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                }

                // Destination card (updated)
                const { d, index } = item;

                // Link separation strategy:
                // - The image links to the destination page
                // - The CTA "Scopri di più" links to the destination page
                // - The region pill links to a filtered destinations page by region
                const mediaAspect =
                  index % 5 === 0
                    ? 'aspect-[4/5]'
                    : index % 3 === 0
                    ? 'aspect-[3/4]'
                    : 'aspect-video';

                return (
                  <div key={d.countrySlug} className='break-inside-avoid'>
                    <Card>
                      {/* Clickable media only */}
                      <Link
                        href={`/destinations/${d.countrySlug}`}
                        aria-label={`Apri destinazione: ${d.country}`}
                        className='block'
                      >
                        <CardMedia className={mediaAspect}>
                          <Image
                            src={d.coverImage ?? '/world-placeholder.png'}
                            alt={d.country}
                            fill
                            sizes='(max-width: 1024px) 100vw, 33vw'
                            className='object-cover'
                          />
                        </CardMedia>
                      </Link>

                      <CardBody>
                        <CardMetaRow className='mb-2'>
                          <CardTitle>{d.country}</CardTitle>

                          {/* Region pill as a LINK (no nested button) */}
                          <Link
                            href={`/destinations?region=${encodeURIComponent(
                              d.region
                            )}`}
                            aria-label={`Filtra per regione: ${d.region}`}
                            className='shrink-0'
                          >
                            <span className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-3xl border border-white/50 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--paguro-coral)]'>
                              {d.region}
                            </span>
                          </Link>
                        </CardMetaRow>

                        <p className='t-meta'>Blog {d.count}</p>

                        {/* Clickable CTA */}
                        <Link
                          href={`/destinations/${d.countrySlug}`}
                          aria-label={`Scopri di più su ${d.country}`}
                          className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 hover:text-[color:var(--paguro-link-hover)]'
                        >
                          Scopri di più <span aria-hidden>➜</span>
                        </Link>
                      </CardBody>
                    </Card>
                  </div>
                );
              });
            })()}
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
