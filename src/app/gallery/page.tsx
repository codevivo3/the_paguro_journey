import dynamic from 'next/dynamic';

import { getGalleryImages } from '@/lib/gallery';

const GalleryGrid = dynamic(() => import('@/components/gallery/GalleryGrid'), {
  // GalleryGrid uses `useSearchParams()` which triggers a CSR bailout unless wrapped in
  // a Suspense boundary during prerender. Disabling SSR is the most conservative fix.
  ssr: false,
  loading: () => (
    <div className='rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 text-sm text-[color:var(--paguro-text)]/70'>
      Caricamento galleria…
    </div>
  ),
});

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
          <GalleryGrid items={items} />
        </section>
      </div>
    </main>
  );
}
