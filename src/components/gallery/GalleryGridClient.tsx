'use client';

import dynamic from 'next/dynamic';
import type { GalleryImage } from './GalleryGrid';

const GalleryGrid = dynamic(() => import('./GalleryGrid'), {
  ssr: false,
  loading: () => (
    <div className='rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 text-sm text-[color:var(--paguro-text)]/70'>
      Caricamento galleria…
    </div>
  ),
});

export default function GalleryGridClient({
  items,
}: {
  items: GalleryImage[];
}) {
  return <GalleryGrid items={items} />;
}
