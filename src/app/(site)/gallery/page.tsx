// src/app/(site)/gallery/page.tsx
import * as React from 'react';
import type { Metadata } from 'next';

import GalleryGridClient from '@/components/gallery/GalleryGridClient';
import type { GalleryImage } from '@/components/gallery/GalleryGrid';

import { getGalleryItems } from '@/sanity/queries/gallery';
import { mapSanityToGalleryImages } from '@/lib/gallery-sanity';

export const metadata: Metadata = {
  title: 'Gallery | The Paguro Journey',
  description:
    'Una raccolta visiva dei nostri viaggi: fotografie autentiche da destinazioni nel mondo. Clicca ogni immagine per vederla in alta risoluzione.',
  alternates: { canonical: '/gallery' },
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
    description: 'Fotografie di viaggio autentiche da The Paguro Journey.',
    images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
  },
};

export default async function GalleryPage() {
  const sanityItems = await getGalleryItems();
  // Map Sanity docs -> UI GalleryImage type
  const items: GalleryImage[] = mapSanityToGalleryImages(sanityItems, (x) => ({
    src: x.src,

    // ✅ required by your UI type
    countrySlug: x.countrySlug ?? 'unknown',

    alt: x.alt ?? undefined,

    // ✅ normalize to match GalleryImage orientation type
    // UI allows only: 'portrait' | 'landscape' | undefined
    orientation:
      x.orientation === 'portrait' || x.orientation === 'landscape'
        ? x.orientation
        : undefined,
  }));

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
          <GalleryGridClient items={items} />
        </section>
      </div>
    </main>
  );
}
