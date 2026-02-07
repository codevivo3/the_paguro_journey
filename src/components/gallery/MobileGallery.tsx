'use client';

import * as React from 'react';
import MediaImage from '@/components/features/media/MediaImage';
import type { Lang } from '@/lib/route';
import type { GalleryImage } from './galleryTypes';
import {
  type AspectClass,
  getObjectPosition,
  pickMobileForcedAspect,
} from './galleryLayout';

type MobileGalleryProps = {
  lang: Lang;
  items: GalleryImage[];
  labels: {
    open: string;
    altFallback: string;
  };
  onOpen: (index: number) => void;
  cardClassName: string;
  priorityCount?: number;
};

const FullBleed: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className='relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] px-2'>
    {children}
  </div>
);

export default function MobileGallery({
  lang,
  items,
  labels,
  onOpen,
  cardClassName,
  priorityCount = 12,
}: MobileGalleryProps) {
  const columns = 3;
  type Placed = { img: GalleryImage; index: number; aspect: AspectClass };

  const cols: Placed[][] = Array.from({ length: columns }, () => []);
  const colHeights = Array.from({ length: columns }, () => 0);

  const aspectToRatio = (a: AspectClass) => {
    switch (a) {
      case 'aspect-square':
        return 1;
      case 'aspect-video':
        return 16 / 9;
      case 'aspect-[3/4]':
        return 3 / 4;
      case 'aspect-[4/5]':
        return 4 / 5;
      case 'aspect-[21/9]':
        return 21 / 9;
      default:
        return 16 / 9;
    }
  };

  const pickShortestCol = () => {
    let best = 0;
    for (let i = 1; i < colHeights.length; i++) {
      if (colHeights[i] < colHeights[best]) best = i;
    }
    return best;
  };

  items.forEach((img, index) => {
    const colIndex = pickShortestCol();
    const aspect = pickMobileForcedAspect(img, index, colIndex);

    cols[colIndex].push({ img, index, aspect });

    const ratio = aspectToRatio(aspect);
    colHeights[colIndex] += 1 / ratio + 0.08;
  });

  return (
    <FullBleed>
      <div className='grid grid-cols-3 gap-2'>
        {cols.map((colItems, colIndex) => (
          <div key={colIndex} className='flex flex-col gap-2'>
            {colItems.map(({ img, index, aspect }) => {
              const alt = img.alt ?? labels.altFallback;
              const objectPosition = getObjectPosition(img);

              const isPriority = index < priorityCount;

              return (
                <button
                  key={img.src}
                  type='button'
                  onClick={() => onOpen(index)}
                  aria-label={labels.open}
                  className={cardClassName}
                >
                  <div className={`relative w-full ${aspect}`}>
                    <MediaImage
                      lang={lang}
                      src={img.src}
                      sanityImage={img.sanityImage}
                      hotspot={img.hotspot ?? null}
                      crop={img.crop ?? null}
                      alt={alt}
                      fill
                      sizes='(max-width: 640px) 33vw, (max-width: 1024px) 50vw, 33vw'
                      className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                      style={{ objectPosition }}
                      // MOBILE: avoid iOS/Safari IntersectionObserver edge-cases that can leave
                      // above-the-fold items blank. We still keep `priority` bounded.
                      loading='eager'
                      priority={isPriority}
                      fetchPriority={isPriority ? 'high' : 'auto'}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </FullBleed>
  );
}
