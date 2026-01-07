import { getDestinationsFromPosts, facts } from '@/lib/posts';
import Image from 'next/image';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardPill,
  CardMetaRow,
} from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
        <section
          aria-label='Filters'
          className='flex flex-wrap items-center justify-center gap-3'
        >
          <span className='text-sm text-[color:var(--paguro-text)]/60'>
            Filtri (in arrivo):
          </span>
          <Button className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'>
            Continente
          </Button>
          <Button className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'>
            Paese
          </Button>
          <Button className='rounded-full border-2 border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-2 text-sm text-[color:var(--paguro-text)] shadow-sm'>
            Stile di viaggio
          </Button>
        </section>

        {/* Destinations grid */}
        <section aria-label='Destinations' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>{destinations.length} destinazioni</span>
          </div>

          <div className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
            {(() => {
              const items: Array<
                | {
                    type: 'destination';
                    d: (typeof destinations)[number];
                    index: number;
                  }
                | { type: 'fact'; f: (typeof facts)[number]; index: number }
              > = [];

              // Insert a fact card every 3 destination cards (tweak to taste)
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
                            <h3 className='t-card-title whitespace-pre-line'>
                              {item.f.title}
                            </h3>
                            <Button className='rounded-full border-2 border-[color:var(--paguro-border)] bg-white/50 px-3 py-1 text-xs text-black/80 h- w-auto inline-flex items-center justify-center whitespace-nowrap leading-none'>
                              {item.f.pill}
                            </Button>
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

                // Destination card (same as before)
                const { d, index } = item;

                const mediaAspect =
                  index % 5 === 0
                    ? 'aspect-[4/5]'
                    : index % 3 === 0
                    ? 'aspect-[3/4]'
                    : 'aspect-video';

                return (
                  <div key={d.countrySlug} className='break-inside-avoid'>
                    <Card
                      href={`/destinations/${d.countrySlug}`}
                      ariaLabel={`Apri destinazione: ${d.country}`}
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

                      <CardBody>
                        <CardMetaRow className='mb-2'>
                          <CardTitle>{d.country}</CardTitle>
                          <CardPill>{d.region}</CardPill>
                        </CardMetaRow>

                        <p className='t-meta'>Blog {d.count}</p>

                        <div className='mt-auto pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]'>
                          Scopri di più <span aria-hidden>➜</span>
                        </div>
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
