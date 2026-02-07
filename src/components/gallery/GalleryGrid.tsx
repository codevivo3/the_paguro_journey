'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import GalleryModal from '../ui/GalleryModal';
import DesktopGallery from './DesktopGallery';
import MobileGallery from './MobileGallery';
import type { GalleryImage } from './galleryTypes';

import { safeLang, type Lang } from '@/lib/route';

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();

    // Safari < 14 fallback
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }

    mql.addListener(onChange);
    return () => mql.removeListener(onChange);
  }, [query]);

  return matches;
}

export type { GalleryImage } from './galleryTypes';

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
  columnsClassName = 'columns-2 gap-4 space-y-4 md:columns-2 md:gap-6 md:space-y-6 lg:columns-3',
  priorityCount = 3,
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

  const isMobile = useMediaQuery('(max-width: 640px)');

  const effectiveColumnsClassName = columnsClassName;

  // Container: on mobile go full width (avoid the “center strip”), on desktop keep current padding.
  const containerPaddingClassName = isMobile ? 'px-2' : 'px-3 sm:px-4';
  const containerMaxWidthClassName = isMobile ? 'max-w-none' : 'max-w-[980px]';

  // Card styling: mobile NO shadow; desktop keeps shadow.
  const cardClassName = isMobile
    ? 'group block w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)]/70 bg-[color:var(--paguro-surface)]'
    : 'group block w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm';

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
      <div className={`mx-auto w-full ${containerMaxWidthClassName} ${containerPaddingClassName}`}>
        {isMobile ? (
          <MobileGallery
            lang={effectiveLang}
            items={items}
            labels={labels}
            onOpen={open}
            cardClassName={cardClassName}
          />
        ) : (
          <DesktopGallery
            lang={effectiveLang}
            items={items}
            labels={labels}
            onOpen={open}
            columnsClassName={effectiveColumnsClassName}
            cardClassName={cardClassName}
            priorityCount={priorityCount}
          />
        )}
      </div>

      {/* Modal (UI extracted) */}
      <GalleryModal
        lang={effectiveLang}
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
