import type { Metadata } from 'next';
import { draftMode } from 'next/headers';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import { CardPill } from '@/components/ui/Card';
import { DestinationCardClient } from '@/components/features/destinations/DestinationCardClient';

import { getCountriesForDestinations } from '@/sanity/queries/destinations';

import { getGalleryImagesByCountry } from '@/lib/gallery';
import { urlFor } from '@/sanity/lib/image';

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

export default async function DestinationsPage() {
  const { isEnabled } = await draftMode();
  const countries = await getCountriesForDestinations({ preview: isEnabled });

  type RegionLike = {
    titleIt?: string;
    title?: string;
    name?: string;
    label?: string;
    slug?: string | { current?: string };
  } | null;

  const getRegionFromCountry = (country: unknown): RegionLike => {
    if (!country || typeof country !== 'object') return null;
    const obj = country as { worldRegion?: RegionLike; region?: RegionLike };
    return obj.worldRegion ?? obj.region ?? null;
  };

  const destinations = countries.map((c) => {
    const r = getRegionFromCountry(c);

    const regionName =
      (r && (r.titleIt || r.title || r.name || r.label)) || 'Altro';

    const regionSlug =
      (r && (typeof r.slug === 'string' ? r.slug : r.slug?.current)) || 'other';

    return {
      country: c.title,
      countrySlug: c.slug,
      region: regionName,
      regionSlug: typeof regionSlug === 'string' ? regionSlug : 'other',
      count: c.postCount,
      coverImage: c.coverImage,
    };
  });

  // Only show countries that actually have at least 1 related blog post.
  // This prevents the UI from looking “broken” when most countries have 0 posts.
  const visibleDestinations = destinations.filter((d) => (d.count ?? 0) > 0);

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
            <CardPill
              key={label}
              href={`/destinations?filter=${label.toLowerCase()}`}
              ariaLabel={`Filtra destinazioni per ${label.toLowerCase()}`}
              className='cursor-pointer'
            >
              {label}
            </CardPill>
          ))}
        </section>

        {/* Destinations */}
        <section aria-label='Destinations' className='space-y-5 pb-16'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Esplora</h2>
            <span className='t-meta'>
              {visibleDestinations.length} destinazioni
            </span>
          </div>

          <Masonry className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
            {visibleDestinations.map((d, i) => {
              const gallery = getGalleryImagesByCountry(d.countrySlug);
              const localCover = gallery[0];
              const orientation = localCover?.orientation;

              const sanityCoverUrl = d.coverImage
                ? urlFor(d.coverImage).width(1200).height(900).fit('crop').url()
                : null;

              const coverSrc =
                sanityCoverUrl ?? localCover?.src ?? '/world-placeholder.png';

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
                  <DestinationCardClient
                    href={`/destinations/${d.countrySlug}`}
                    regionHref={`/destinations?region=${d.regionSlug}`}
                    country={d.country}
                    region={d.region}
                    count={d.count ?? 0}
                    coverSrc={coverSrc}
                    mediaAspect={mediaAspect}
                  />
                </MasonryItem>
              );
            })}
          </Masonry>
        </section>
      </div>
    </main>
  );
}
