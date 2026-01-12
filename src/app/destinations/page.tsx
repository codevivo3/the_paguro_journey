import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardMetaRow,
  FactCard,
} from '@/components/ui/Card';

import NewsletterForm from '@/components/features/newsletter/NewsletterForm';

import { getDestinationsFromPosts, facts } from '@/lib/posts';
import { getGalleryImagesByCountry } from '@/lib/gallery';

/* -------------------------------------------------------------------------- */
/* SEO                                                                        */
/* -------------------------------------------------------------------------- */

export const metadata: Metadata = {
  title: 'Destinazioni | The Paguro Journey',
  description:
    'Esplora tutte le destinazioni di The Paguro Journey: paesi, regioni e racconti di viaggio tra blog, video e appunti pratici.',
  alternates: { canonical: '/destinations' },
  openGraph: {
    title: 'Destinazioni | The Paguro Journey',
    description:
      'Una mappa dei luoghi che abbiamo esplorato: destinazioni, regioni e articoli collegati.',
    url: '/destinations',
    siteName: 'The Paguro Journey',
    type: 'website',
    locale: 'it_IT',
    images: [
      {
        url: '/destinations/images/cover/copertina-the-paguro-journey-1.jpg',
        width: 1200,
        height: 630,
        alt: 'The Paguro Journey — Destinazioni',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Destinazioni | The Paguro Journey',
    description:
      'Esplora destinazioni, regioni e racconti di viaggio di The Paguro Journey.',
    images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
  },
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

const destinations = getDestinationsFromPosts();

export default function DestinationsPage() {
  return (
    <main className='px-6 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Destinazioni</h1>
          <p className='t-page-subtitle'>
            Una mappa semplice dei luoghi che abbiamo esplorato — tra storie,
            video e appunti pratici.
          </p>
        </header>

        {/* Filters placeholder */}
        <section
          aria-label='Filtri'
          className='flex flex-wrap items-center justify-center gap-3'
        >
          <span className='text-sm text-[color:var(--paguro-text)]/60'>
            Filtri (in arrivo):
          </span>
          {['Continente', 'Paese', 'Stile di viaggio'].map((label) => (
            <Link
              key={label}
              href=''
              className='inline-flex h-10 items-center justify-center rounded-3xl border border-white/40 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-sm text-white shadow-sm hover:bg-[color:var(--paguro-coral)]'
            >
              {label}
            </Link>
          ))}
        </section>

        {/* Destinations */}
        <section aria-label='Destinations' className='space-y-5 pb-16'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>{destinations.length} destinazioni</span>
          </div>

          <Masonry className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
            {(() => {
              const items: Array<
                | {
                    type: 'destination';
                    d: (typeof destinations)[number];
                    i: number;
                  }
                | { type: 'fact'; f: (typeof facts)[number]; i: number }
              > = [];

              const INSERT_EVERY = 2;
              let factCursor = 0;

              destinations.forEach((d, i) => {
                items.push({ type: 'destination', d, i });

                if ((i + 1) % INSERT_EVERY === 0 && factCursor < facts.length) {
                  items.push({ type: 'fact', f: facts[factCursor], i });
                  factCursor++;
                }
              });

              return items.map((item, streamIndex) => {
                /* ---------------------------------- */
                /* Fact cards                          */
                /* ---------------------------------- */
                if (item.type === 'fact') {
                  const factClass =
                    streamIndex % 7 === 0 ? 'min-h-[18rem]' : 'min-h-[14rem]';

                  const pillHref =
                    item.f.scope === 'region' && item.f.regionSlug
                      ? `/destinations?region=${item.f.regionSlug}`
                      : item.f.scope === 'style' && item.f.style
                      ? `/destinations?style=${item.f.style}`
                      : '';

                  return (
                    <MasonryItem key={`fact-${streamIndex}`}>
                      <FactCard
                        title={item.f.title}
                        pill={item.f.pill ?? ''}
                        pillHref={pillHref}
                        pillAriaLabel={item.f.pill ?? ''}
                        text={item.f.text}
                        minHeightClass={factClass}
                      />
                    </MasonryItem>
                  );
                }

                /* ---------------------------------- */
                /* Destination cards                  */
                /* ---------------------------------- */

                const { d, i } = item;

                const gallery = getGalleryImagesByCountry(d.countrySlug);
                const coverImage = gallery[0];
                const orientation = gallery[0]?.orientation;

                const mediaAspect =
                  orientation === 'portrait'
                    ? 'aspect-[3/4]'
                    : orientation === 'landscape'
                    ? 'aspect-video'
                    : i % 5 === 0
                    ? 'aspect-[4/5]'
                    : i % 3 === 0
                    ? 'aspect-[3/4]'
                    : 'aspect-video';

                return (
                  <MasonryItem key={d.countrySlug}>
                    <Card>
                      <Link
                        href={`/destinations/${d.countrySlug}`}
                        aria-label={`Apri destinazione: ${d.country}`}
                        className='block'
                      >
                        <CardMedia className={mediaAspect}>
                          <Image
                            src={coverImage?.src ?? '/world-placeholder.png'}
                            alt={d.country}
                            fill
                            sizes='(max-width: 1024px) 100vw, 33vw'
                            className='object-cover transition-transform duration-300 hover:scale-[1.02]'
                          />
                        </CardMedia>
                      </Link>

                      <CardBody>
                        <CardMetaRow className='mb-2'>
                          <CardTitle>{d.country}</CardTitle>

                          <Link
                            href={`/destinations?region=${d.regionSlug}`}
                            className='shrink-0'
                          >
                            <span className='inline-flex h-10 items-center justify-center rounded-3xl border border-white/50 bg-[color:var(--geo-btn)] px-3 text-xs font-semibold [font-family:var(--font-ui)] text-white shadow-sm hover:bg-[color:var(--paguro-coral)]'>
                              {d.region}
                            </span>
                          </Link>
                        </CardMetaRow>

                        <p className='t-meta'>Blog {d.count}</p>

                        <Link
                          href={`/destinations/${d.countrySlug}`}
                          className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] hover:text-[color:var(--paguro-link-hover)]'
                        >
                          Scopri di più <span aria-hidden>➜</span>
                        </Link>
                      </CardBody>
                    </Card>
                  </MasonryItem>
                );
              });
            })()}
          </Masonry>
        </section>

        <NewsletterForm />
      </div>
    </main>
  );
}
