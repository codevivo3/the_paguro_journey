// src/app/[lang]/(site)/gallery/page.tsx
import * as React from 'react';
import type { Metadata } from 'next';

import GalleryGridClient from '@/components/gallery/GalleryGridClient';
import type { GalleryImage } from '@/components/gallery/GalleryGrid';

import { getGalleryItems } from '@/sanity/queries/gallery';
import { mapSanityToGalleryImages } from '@/lib/gallery-sanity';

import { safeLang, type Lang } from '@/lib/route';

type PageProps = {
  params: Promise<{ lang: Lang }>;
};

function withLangPrefix(path: string, lang: Lang) {
  if (lang === 'en') return path.startsWith('/en') ? path : `/en${path}`;
  return path;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const meta = {
    it: {
      title: 'Gallery | The Paguro Journey',
      description:
        'Una raccolta visiva dei nostri viaggi: fotografie autentiche da destinazioni nel mondo. Clicca ogni immagine per vederla in alta risoluzione.',
      ogDescription:
        'Fotografie di viaggio da tutto il mondo: uno sguardo visivo sul progetto The Paguro Journey.',
      ogAlt: 'Gallery fotografica di The Paguro Journey',
      locale: 'it_IT',
      twitterDescription: 'Fotografie di viaggio autentiche da The Paguro Journey.',
    },
    en: {
      title: 'Gallery | The Paguro Journey',
      description:
        'A visual collection of our journeys: authentic travel photos from destinations around the world. Click any image to view it in full resolution.',
      ogDescription:
        'Travel photography from around the world: a visual look into The Paguro Journey project.',
      ogAlt: 'The Paguro Journey photo gallery',
      locale: 'en_US',
      twitterDescription: 'Authentic travel photography from The Paguro Journey.',
    },
  } as const;

  const m = meta[effectiveLang];
  const canonical = withLangPrefix('/gallery', effectiveLang);

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical },
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      url: canonical,
      siteName: 'The Paguro Journey',
      locale: m.locale,
      type: 'website',
      images: [
        {
          url: '/destinations/images/cover/copertina-the-paguro-journey-1.jpg',
          width: 1200,
          height: 675,
          alt: m.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.twitterDescription,
      images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
    },
  };
}

export default async function GalleryPage({ params }: PageProps) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const sanityItems = await getGalleryItems();
  // Map Sanity docs -> UI GalleryImage type
  const items: GalleryImage[] = mapSanityToGalleryImages(sanityItems, effectiveLang, (x) => ({
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
            {effectiveLang === 'en'
              ? 'Just photos. Click to open the full-resolution version.'
              : 'Solo foto. Clicca per aprire la versione full-res.'}
          </p>
        </header>

        <section aria-label={effectiveLang === 'en' ? 'Gallery' : 'Galleria'} className='space-y-5'>
          <GalleryGridClient items={items} />
        </section>
      </div>
    </main>
  );
}
