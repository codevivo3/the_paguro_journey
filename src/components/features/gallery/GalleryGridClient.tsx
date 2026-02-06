'use client';

import Link from 'next/link';

import MediaImage from '@/components/features/media/MediaImage';
import { safeLang, type Lang } from '@/lib/route';

type GalleryImage = {
  src: string;
  alt?: string | null;
  countrySlug: string;
  orientation?: 'portrait' | 'landscape' | string;
};

function GalleryItem({ item, lang }: { item: GalleryImage; lang?: Lang }) {
  const effectiveLang: Lang = safeLang(lang);
  const aspect =
    item.orientation === 'portrait' ? 'aspect-[3/4]' : 'aspect-video';
  const fallbackLabel = effectiveLang === 'en' ? 'Open image' : 'Apri immagine';

  return (
    <Link
      href={`/gallery/${item.countrySlug}`}
      aria-label={item.alt ?? fallbackLabel}
      className='block'
    >
      <div className={`relative ${aspect} overflow-hidden rounded-md`}>
        <MediaImage
          src={item.src}
          alt={item.alt ?? ''}
          fill
          sizes='(max-width: 768px) 50vw, 33vw'
          className='object-cover'
        />
      </div>
    </Link>
  );
}
