'use client';

import * as React from 'react';
import MediaImage from '@/components/features/media/MediaImage';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import GalleryModal from '../ui/GalleryModal';

import { safeLang, type Lang } from '@/lib/route';

export type GalleryImage = {
  src: string;
  countrySlug: string;
  alt?: string;
  caption?: string | null;
  orientation?: 'portrait' | 'landscape';
};

type GalleryGridProps = {
  lang?: Lang;
  items: GalleryImage[];

  /**
   * Optional: how many columns at breakpoints.
   * Defaults match your Destinations masonry layout.
   */
  columnsClassName?: string;

  /**
   * Optional: mark first N images as priority for Next/Image.
   * Keep it small (e.g. 3) to avoid performance issues.
   */
  priorityCount?: number;

  /**
   * Optional: override the "rhythm" aspect classes.
   * If not provided, we use the same index-based variety you had.
   */
  getAspectClassName?: (img: GalleryImage, index: number) => string;
};

/**
 * GalleryGrid
 *
 * Responsibilities:
 * - Masonry grid
 * - URL-driven state (?img=...)
 * - Keyboard handling (Esc/Left/Right)
 * - Body scroll lock while modal open
 *
 * UI for the modal lives in GalleryModal.tsx
 */
export default function GalleryGrid({
  lang,
  items,
  columnsClassName = 'columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3',
  priorityCount = 3,
  getAspectClassName,
}: GalleryGridProps) {
  const effectiveLang: Lang = safeLang(lang);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const t = {
    it: {
      empty: 'Nessuna immagine disponibile.',
      open: 'Apri immagine',
      altFallback: 'Foto viaggio',
    },
    en: {
      empty: 'No images available.',
      open: 'Open image',
      altFallback: 'Travel photo',
    },
  } as const;

  const labels = t[effectiveLang];

  // URL-driven modal state: store selected image src in `img`
  const imgParam = searchParams.get('img');

  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const isOpen = openIndex !== null;
  const current = openIndex !== null ? items[openIndex] : null;

  // Sync internal state with URL
  React.useEffect(() => {
    if (!imgParam) {
      setOpenIndex(null);
      return;
    }
    const idx = items.findIndex((it) => it.src === imgParam);
    setOpenIndex(idx >= 0 ? idx : null);
  }, [imgParam, items]);

  const aspectFor = React.useCallback(
    (img: GalleryImage, index: number) => {
      if (getAspectClassName) return getAspectClassName(img, index);

      if (img.orientation === 'portrait') return 'aspect-[3/4]';
      if (img.orientation === 'landscape') return 'aspect-video';

      return index % 7 === 0
        ? 'aspect-[4/5]'
        : index % 5 === 0
        ? 'aspect-[3/4]'
        : index % 3 === 0
        ? 'aspect-video'
        : 'aspect-square';
    },
    [getAspectClassName]
  );

  const buildUrlWithoutImg = React.useCallback(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete('img');
    const qs = sp.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }, [pathname, searchParams]);

  const buildUrlWithImg = React.useCallback(
    (src: string) => {
      const sp = new URLSearchParams(searchParams.toString());
      sp.set('img', src);
      return `${pathname}?${sp.toString()}`;
    },
    [pathname, searchParams]
  );

  const close = React.useCallback(() => {
    router.replace(buildUrlWithoutImg(), { scroll: false });
  }, [router, buildUrlWithoutImg]);

  const open = React.useCallback(
    (index: number) => {
      const src = items[index]?.src;
      if (!src) return;
      router.push(buildUrlWithImg(src), { scroll: false });
    },
    [router, items, buildUrlWithImg]
  );

  const prev = React.useCallback(() => {
    if (openIndex === null) return;
    const nextIndex = (openIndex - 1 + items.length) % items.length;
    open(nextIndex);
  }, [openIndex, items.length, open]);

  const next = React.useCallback(() => {
    if (openIndex === null) return;
    const nextIndex = (openIndex + 1) % items.length;
    open(nextIndex);
  }, [openIndex, items.length, open]);

  // Lock body scroll while modal is open
  React.useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close, prev, next]);

  if (!items.length) {
    return (
      <div className='rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 text-sm text-[color:var(--paguro-text)]/70'>
        {labels.empty}
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <Masonry className={columnsClassName}>
        {items.map((img, index) => {
          const aspect = aspectFor(img, index);
          const alt = img.alt ?? labels.altFallback;

          return (
            <MasonryItem key={img.src}>
              <button
                type='button'
                onClick={() => open(index)}
                aria-label={labels.open}
                className='group block w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm'
              >
                <div className={`relative w-full ${aspect}`}>
                  <MediaImage
                    lang={effectiveLang}
                    src={img.src}
                    alt={alt}
                    fill
                    sizes='(max-width: 1024px) 100vw, 33vw'
                    className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
                    priority={index < priorityCount}
                  />
                </div>
              </button>
            </MasonryItem>
          );
        })}
      </Masonry>

      {/* Modal (UI extracted) */}
      <GalleryModal
        isOpen={isOpen}
        current={current}
        openIndex={openIndex}
        total={items.length}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
