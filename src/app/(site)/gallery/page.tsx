import * as React from 'react';

import { getGalleryImages } from '@/lib/gallery';
import GalleryGridClient from '@/components/gallery/GalleryGridClient';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery | The Paguro Journey',
  description:
    'Una raccolta visiva dei nostri viaggi: fotografie autentiche da destinazioni nel mondo. Clicca ogni immagine per vederla in alta risoluzione.',
  alternates: {
    canonical: '/gallery',
  },
  openGraph: {
    title: 'Gallery | The Paguro Journey',
    description:
      'Fotografie di viaggio da tutto il mondo: uno sguardo visivo sul progetto The Paguro Journey.',
    url: '/gallery',
    siteName: 'The Paguro Journey',
    locale: 'it_IT',
    type: 'website',
    images: [
      {
        url: '/destinations/images/cover/copertina-the-paguro-journey-1.jpg',
        width: 1200,
        height: 675,
        alt: 'Gallery fotografica di The Paguro Journey',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gallery | The Paguro Journey',
    description:
      'Fotografie di viaggio autentiche da The Paguro Journey.',
    images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
  },
};

// GalleryPage
// Static page with SEO-friendly metadata.
// The image grid itself is client-rendered for interactivity,
// while the page shell remains server-rendered for performance and indexing.
export default function GalleryPage() {
  const items = getGalleryImages();

  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        <header className='space-y-3'>
          <h1 className='t-page-title'>Gallery</h1>
          <p className='t-page-subtitle'>
            Solo foto. Clicca per aprire la versione full-res.
          </p>
        </header>

        <section aria-label='Gallery' className='space-y-5'>
          {/* GalleryGridClient relies on client-side state and routing. */}
          {/* Suspense provides a graceful loading state without hurting SEO. */}
          <React.Suspense
            fallback={
              <div className='rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 text-sm text-[color:var(--paguro-text)]/70'>
                Caricamento galleria…
              </div>
            }
          >
            <GalleryGridClient items={items} />
          </React.Suspense>
        </section>
      </div>
    </main>
  );
}
