import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Destinazioni | The Paguro Journey',
  description:
    'Esplora tutte le destinazioni di The Paguro Journey: paesi, regioni e racconti di viaggio tra blog, video e appunti pratici.',
  alternates: {
    canonical: '/destinations',
  },
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

import { getDestinationsFromPosts, facts } from '@/lib/posts';
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

// SEO/UX: This index page aggregates destinations derived from posts.
// Layout: Masonry grid mixes destination cards with small “fact” cards to keep scanning engaging.
const destinations = getDestinationsFromPosts();

export default function DestinationsPage() {
  return (
    <main className='px-6 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Destinazioni</h1>
          <p className='t-page-subtitle'>
            Una mappa semplice dei luoghi che abbiamo esplorato — tra storie,
            video e appunti pratici.
          </p>
        </header>

        {/* Filters (coming soon)
            SEO/UX: These are placeholders for future client-side filtering (region, country, travel style).
            Keep as real links later to create crawlable filter states if desired. */}
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

        {/* Destinations grid
            SEO/UX: Internal links to destination pages help discovery and pass relevance across the site. */}
        <section aria-label='Destinations' className='space-y-5 pb-16'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>{destinations.length} destinazioni</span>
          </div>

          {/* Masonry grid (shared component)
              UI: Uses CSS columns to simulate masonry while keeping markup simple. */}
          <Masonry className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
            {(() => {
              // Stream-mixing: interleave destinations with “facts” to avoid a monotonous grid.
              // Facts can later become filter entry points (region/style) to improve navigation.
              const items: Array<
                | {
                    type: 'destination';
                    d: (typeof destinations)[number];
                    index: number;
                  }
                | { type: 'fact'; f: (typeof facts)[number]; index: number }
              > = [];

              // Controls how often fact cards appear. Tune for density vs. readability.
              const INSERT_EVERY = 2;
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
                  // Visual rhythm: some fact cards are taller to break the column flow.
                  const factClass =
                    streamIndex % 7 === 0 ? 'min-h-[18rem]' : 'min-h-[14rem]';

                  // Facts can point to different filters (e.g. region or travel style).
                  // We derive the pill link + aria label from the fact metadata.
                  const pillHref =
                    item.f.scope === 'region' && item.f.regionSlug
                      ? `/destinations?region=${encodeURIComponent(
                          item.f.regionSlug
                        )}`
                      : item.f.scope === 'style' && item.f.style
                      ? `/destinations?style=${encodeURIComponent(
                          item.f.style
                        )}`
                      : '';

                  const pillAriaLabel =
                    item.f.scope === 'region' && item.f.regionSlug
                      ? `Filtra per regione: ${item.f.pill ?? ''}`
                      : item.f.scope === 'style' && item.f.style
                      ? `Filtra per stile di viaggio: ${item.f.pill ?? ''}`
                      : `Info: ${item.f.pill ?? ''}`;

                  // Human-facing label for the pill (already derived in `facts`).
                  const pillLabel = item.f.pill ?? '';

                  return (
                    <MasonryItem key={`fact-${streamIndex}`}>
                      <FactCard
                        title={item.f.title}
                        pill={pillLabel}
                        pillHref={pillHref}
                        pillAriaLabel={pillAriaLabel}
                        text={item.f.text}
                        minHeightClass={factClass}
                      />
                    </MasonryItem>
                  );
                }

                // Destination card
                const { d, index } = item;

                // Visual rhythm: vary aspect ratios so the masonry scan feels less repetitive.
                const mediaAspect =
                  index % 5 === 0
                    ? 'aspect-[4/5]'
                    : index % 3 === 0
                    ? 'aspect-[3/4]'
                    : 'aspect-video';

                return (
                  <MasonryItem key={d.countrySlug}>
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
                            className='object-cover transition-transform duration-300 hover:scale-[1.02]'
                          />
                        </CardMedia>
                      </Link>

                      <CardBody>
                        <CardMetaRow className='mb-2'>
                          <CardTitle>{d.country}</CardTitle>

                          {/* Region pill as a LINK (no nested button) */}
                          <Link
                            href={`/destinations?region=${encodeURIComponent(
                              d.regionSlug
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

