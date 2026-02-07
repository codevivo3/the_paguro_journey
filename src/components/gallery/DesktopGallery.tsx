'use client';

import * as React from 'react';
import MediaImage from '@/components/features/media/MediaImage';
import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import type { Lang } from '@/lib/route';
import type { GalleryImage } from './galleryTypes';
import { getObjectPosition, pickRemixedAspectDesktop } from './galleryLayout';

type DesktopGalleryProps = {
  lang: Lang;
  items: GalleryImage[];
  labels: {
    open: string;
    altFallback: string;
  };
  onOpen: (index: number) => void;
  columnsClassName: string;
  cardClassName: string;
  priorityCount: number;
};

export default function DesktopGallery({
  lang,
  items,
  labels,
  onOpen,
  columnsClassName,
  cardClassName,
  priorityCount,
}: DesktopGalleryProps) {
  return (
    <Masonry className={columnsClassName}>
      {items.map((img, index) => {
        const aspect = pickRemixedAspectDesktop(img);
        const alt = img.alt ?? labels.altFallback;
        const objectPosition = getObjectPosition(img);

        return (
          <MasonryItem key={img.src}>
            <button
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
                  loading={index < priorityCount ? 'eager' : 'lazy'}
                  priority={index < priorityCount}
                  fetchPriority={index < priorityCount ? 'high' : 'auto'}
                />
              </div>
            </button>
          </MasonryItem>
        );
      })}
    </Masonry>
  );
}
