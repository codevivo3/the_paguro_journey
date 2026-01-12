import * as React from 'react';

import { getGalleryImages } from '@/lib/gallery';
import GalleryGridClient from '@/components/gallery/GalleryGridClient';

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
