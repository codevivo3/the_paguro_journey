'use client';

import dynamic from 'next/dynamic';
import type { GalleryImage } from './GalleryGrid';
import { safeLang, type Lang } from '@/lib/route';

function GalleryGridSkeleton() {
  // Keep this aligned with the real grid rhythm (masonry columns + varied aspect ratios)
  const aspects = [
    'aspect-[4/5]',
    'aspect-video',
    'aspect-[3/4]',
    'aspect-square',
    'aspect-video',
    'aspect-[3/4]',
    'aspect-[4/5]',
    'aspect-square',
    'aspect-video',
  ];

  return (
    <div
      aria-label='Loading gallery / Caricamento galleria'
      className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'
    >
      {aspects.map((aspect, i) => (
        <div key={i} className='break-inside-avoid'>
          <div className='w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm'>
            <div className={`relative w-full ${aspect} skeleton`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const GalleryGrid = dynamic(() => import('./GalleryGrid'), {
  ssr: false,
  loading: () => (
    <section aria-label='Gallery / Galleria' className='space-y-5'>
      <GalleryGridSkeleton />
    </section>
  ),
});

export default function GalleryGridClient({
  lang,
  items,
}: {
  lang?: Lang;
  items: GalleryImage[];
}) {
  const effectiveLang: Lang = safeLang(lang);
  return <GalleryGrid lang={effectiveLang} items={items} />;
}
