'use client';

import * as React from 'react';
import MediaImage from '@/components/features/media/MediaImage';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import GalleryModal from '../ui/GalleryModal';

import { safeLang, type Lang } from '@/lib/route';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

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

export type GalleryImage = {
  src: string;
  /** Optional raw Sanity image source for focal-point aware URLs */
  sanityImage?: SanityImageSource;
  countrySlug: string;
  alt?: string;
  caption?:
    | string
    | null
    | {
        it?: string | null;
        en?: string | null;
      };

  /**
   * Original media orientation coming from Sanity.
   * Note: we may still "remix" the displayed aspect for a more dynamic masonry rhythm.
   */
  orientation?: 'portrait' | 'landscape' | 'square' | 'panorama';

  /**
   * Computed/original orientation derived from image asset dimensions.
   * Used for stricter rendering when lockOrientation is enabled.
   */
  assetOrientation?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /**
   * If true, the gallery must keep this image in its original orientation.
   * This is for images that don't crop well when remixed.
   */
  lockOrientation?: boolean;

  /**
   * Optional Sanity image hotspot/crop helpers.
   * Used to keep the subject in-frame when we crop via object-fit: cover.
   */
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  } | null;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null;
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

  // Mobile only
  const isMobile = useMediaQuery('(max-width: 640px)');

  // On mobile we will NOT use CSS-columns (it can cause lazy-loading glitches on iOS/Safari).
  // We render a deterministic 3-column masonry using a grid of 3 flex columns.
  const mobileColumns = 3;
  const mobilePriorityCount = 12;

  // Desktop/tablet: keep your existing Masonry layout untouched.
  const effectiveColumnsClassName = columnsClassName;

  // Container: on mobile go full width (avoid the “center strip”), on desktop keep current padding.
  const containerPaddingClassName = isMobile ? 'px-2' : 'px-3 sm:px-4';
  const containerMaxWidthClassName = isMobile ? 'max-w-none' : 'max-w-[980px]';

  // Card styling: mobile NO shadow; desktop keeps shadow.
  const cardClassName = isMobile
    ? 'group block w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)]/70 bg-[color:var(--paguro-surface)]'
    : 'group block w-full overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm';

  /**
   * Deterministic "random" helpers.
   * We avoid true randomness so the layout doesn't change on every render/reload.
   */
  function hashString(input: string): number {
    // djb2
    let hash = 5381;
    for (let i = 0; i < input.length; i++) {
      hash = (hash * 33) ^ input.charCodeAt(i);
    }
    // Force unsigned 32-bit
    return hash >>> 0;
  }

  type AspectClass =
    | 'aspect-square'
    | 'aspect-video'
    | 'aspect-[3/4]'
    | 'aspect-[4/5]'
    | 'aspect-[21/9]';

  type RemixSafety = {
    fragile: boolean;
    // Allowed aspect classes for mobile remix (compact set)
    allowedMobile: AspectClass[];
  };

  function getRemixSafety(img: GalleryImage): RemixSafety {
    const hx = img.hotspot?.x;
    const hy = img.hotspot?.y;
    const hw = img.hotspot?.width;
    const hh = img.hotspot?.height;

    const ct = img.crop?.top ?? 0;
    const cb = img.crop?.bottom ?? 0;
    const cl = img.crop?.left ?? 0;
    const cr = img.crop?.right ?? 0;

    const hasHotspot =
      typeof hx === 'number' &&
      typeof hy === 'number' &&
      typeof hw === 'number' &&
      typeof hh === 'number';

    // These thresholds were previously too strict and caused many images to be treated as “fragile”,
    // forcing them to stay landscape forever.
    const nearEdge =
      typeof hx === 'number' &&
      typeof hy === 'number' &&
      (hx < 0.12 || hx > 0.88 || hy < 0.12 || hy > 0.88);

    // Only treat as “big subject” when the hotspot is *really* large.
    const bigSubject =
      typeof hw === 'number' && typeof hh === 'number' && (hw > 0.72 || hh > 0.72);

    // Only treat as heavy crop when a meaningful portion is removed.
    const heavyCrop = cl + cr > 0.35 || ct + cb > 0.35;

    const fragile = (hasHotspot && (nearEdge || bigSubject)) || heavyCrop;

    const base = getBaseOrientation(img);

    // Mobile: always return an allowed set.
    // If the item is fragile we still allow *some* remixing, but within safer bounds.
    // (This prevents “a permanent landscape strip” while still respecting hotspot/crop constraints.)
    let allowedMobile: AspectClass[];

    // Helper: stable weighting by repeating items.
    const w = (...a: AspectClass[]) => a;

    if (fragile) {
      switch (base) {
        case 'panorama':
          // Panoramas are inherently fragile on mobile.
          allowedMobile = w('aspect-video', 'aspect-video', 'aspect-[21/9]');
          break;
        case 'portrait':
          // Keep tall-ish, but don’t force super-wide.
          allowedMobile = w(
            'aspect-[4/5]',
            'aspect-[4/5]',
            'aspect-[3/4]',
            'aspect-[3/4]',
            'aspect-square'
          );
          break;
        case 'square':
          allowedMobile = w('aspect-square', 'aspect-square', 'aspect-[3/4]');
          break;
        case 'landscape':
        default:
          // For fragile landscapes, avoid extreme tall crops but allow square/3:4.
          allowedMobile = w(
            'aspect-video',
            'aspect-video',
            'aspect-square',
            'aspect-square',
            'aspect-[3/4]'
          );
          break;
      }

      return { fragile, allowedMobile };
    }

    // Not fragile: allow a wider playful set.
    switch (base) {
      case 'portrait':
        allowedMobile = w(
          'aspect-[4/5]',
          'aspect-[4/5]',
          'aspect-[3/4]',
          'aspect-[3/4]',
          'aspect-square',
          'aspect-square',
          // Only occasionally go wide on mobile
          'aspect-video'
        );
        break;
      case 'square':
        allowedMobile = w(
          'aspect-square',
          'aspect-square',
          'aspect-square',
          'aspect-[3/4]',
          'aspect-[4/5]'
        );
        break;
      case 'panorama':
        allowedMobile = w(
          'aspect-video',
          'aspect-video',
          'aspect-video',
          'aspect-[21/9]',
          'aspect-square'
        );
        break;
      case 'landscape':
      default:
        allowedMobile = w(
          'aspect-video',
          'aspect-video',
          'aspect-square',
          'aspect-square',
          'aspect-[3/4]',
          // A little extra movement on mobile
          'aspect-[4/5]'
        );
        break;
    }

    return { fragile, allowedMobile };
  }

  function pickFromAllowed(seed: number, allowed: AspectClass[]): AspectClass {
    if (!allowed.length) return 'aspect-video';
    return allowed[seed % allowed.length];
  }

  function getBaseOrientation(img: GalleryImage):
    | 'portrait'
    | 'landscape'
    | 'square'
    | 'panorama'
    | undefined {
    // Prefer the orientation derived from the actual asset dimensions when available.
    // This is the “true” original orientation and is what we must honor when lockOrientation is enabled.
    return img.assetOrientation ?? img.orientation;
  }

  function originalAspectFor(img: GalleryImage): AspectClass {
    const o = getBaseOrientation(img);

    switch (o) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'square':
        return 'aspect-square';
      case 'panorama':
        return 'aspect-[21/9]';
      case 'landscape':
      default:
        return 'aspect-video';
    }
  }

  function pickRemixedAspect(img: GalleryImage, columnIndex?: number): AspectClass {
    // Editorial guardrail: some images should never be remixed.
    if (img.lockOrientation) {
      return originalAspectFor(img);
    }

    const baseOrientation = getBaseOrientation(img);

    // Mobile clamp: keep the masonry feel but avoid “neverending strip” tall cards.
    // IMPORTANT: desktop behavior below must remain untouched.
    if (isMobile) {
      // Honor editorial lock first.
      if (img.lockOrientation) return originalAspectFor(img);

      const seed = hashString(img.src);
      const { fragile, allowedMobile } = getRemixSafety(img);

      // If focal data suggests the image is fragile, do NOT remix.
      // This keeps subjects from being pushed out of frame on mobile.
      if (fragile) {
        // Fragile panoramas: keep it reasonable on small screens.
        const o = getBaseOrientation(img);
        if (o === 'panorama') return 'aspect-video';
        return originalAspectFor(img);
      }

      // Use real column index if provided, otherwise fall back to seed % 3.
      const columnHint = typeof columnIndex === 'number' ? columnIndex : (seed % 3);

      // Use a second, stable random stream so we can vary per-column without changing per-image stability.
      const r = (seed ^ (seed >>> 16)) % 100;

      // Helper to enforce per-image safety constraints
      const clampToAllowed = (candidate: AspectClass) =>
        allowedMobile.includes(candidate) ? candidate : pickFromAllowed(seed, allowedMobile);

      // MOBILE: bias the middle column to feel more "alive" (more portrait + square + a bit of wide)
      if (columnHint === 1) {
        // Distribution (middle column):
        // - 40% square
        // - 35% portrait (3/4)
        // - 15% tall (4/5)
        // - 10% wide (video)
        let chosen: AspectClass =
          r < 40
            ? 'aspect-square'
            : r < 75
              ? 'aspect-[3/4]'
              : r < 90
                ? 'aspect-[4/5]'
                : 'aspect-video';

        // Occasional “jump” to avoid repeated runs of the same shape in the middle column.
        if ((seed % 100) < 18) {
          const alt: AspectClass =
            r % 2 === 0 ? 'aspect-[3/4]' : 'aspect-square';
          chosen = alt;
        }

        return clampToAllowed(chosen);
      }

      // Left + right columns: keep a calmer mix
      // - 45% square
      // - 30% portrait (3/4)
      // - 15% tall (4/5)
      // - 10% wide (video)
      let chosen: AspectClass =
        r < 45
          ? 'aspect-square'
          : r < 75
            ? 'aspect-[3/4]'
            : r < 90
              ? 'aspect-[4/5]'
              : 'aspect-video';

      // Small extra nudge for visual variety (stable, deterministic)
      if ((seed % 100) < 12) {
        const idx = allowedMobile.indexOf(chosen);
        if (idx >= 0) {
          chosen = allowedMobile[(idx + 1) % allowedMobile.length];
        }
      }

      return clampToAllowed(chosen);
    }

    const seed = hashString(img.src);
    const r = seed % 100;

    // Base distribution (stable per image):
    // - 25% square
    // - 35% portrait (3/4)
    // - 15% tall (4/5)
    // - 25% landscape (video)
    let chosen: AspectClass =
      r < 30
        ? 'aspect-square'
        : r < 55
        ? 'aspect-[3/4]'
        : r < 70
        ? 'aspect-[4/5]'
        : 'aspect-video';

    // Special case: panoramas can occasionally go ultra-wide.
    // Keep it rare so the grid doesn't become a row of banners.
    if (baseOrientation === 'panorama' && r < 10) {
      chosen = 'aspect-[21/9]';
    }

    // Clamp extremes based on ORIGINAL orientation to reduce aggressive crops.
    if (baseOrientation === 'landscape' || baseOrientation === 'panorama') {
      // Avoid very tall crops too often for wide originals.
      if (chosen === 'aspect-[4/5]') chosen = 'aspect-video';
      if (chosen === 'aspect-[3/4]' && r % 2 === 0) chosen = 'aspect-square';

      // Ultra-wide is only valid for true panoramas.
      if (chosen === 'aspect-[21/9]' && baseOrientation !== 'panorama') {
        chosen = 'aspect-video';
      }
    }

    if (baseOrientation === 'portrait') {
      // Avoid very wide crops too often for tall originals.
      if (chosen === 'aspect-video') {
        chosen = r % 2 === 0 ? 'aspect-square' : 'aspect-[3/4]';
      }

      // Never allow ultra-wide from portrait originals.
      if (chosen === 'aspect-[21/9]') chosen = 'aspect-square';
    }

    // If orientation is square, keep it simple.
    if (baseOrientation === 'square') {
      chosen = r < 20 ? 'aspect-[3/4]' : 'aspect-square';
    }

    return chosen;
  }

  function pickMobileForcedAspect(
    img: GalleryImage,
    globalIndex: number,
    columnIndex: number,
  ): AspectClass {
    // Hard rules first
    if (img.lockOrientation) return originalAspectFor(img);

    const seed = hashString(img.src);
    const { fragile, allowedMobile } = getRemixSafety(img);

    // clampToAllowed: ensure candidate is in allowedMobile, else pick a deterministic allowed one
    const clampToAllowed = (candidate: AspectClass) =>
      allowedMobile.includes(candidate)
        ? candidate
        : pickFromAllowed(seed + globalIndex + columnIndex * 17, allowedMobile);

    // Force a repeating cadence so the layout feels curated.
    // MOBILE ONLY: we keep it deterministic, but add per-column patterns so columns don't look identical.
    // Goal: prevent the middle column from becoming a permanent landscape strip.

    // Base pattern (balanced)
    const basePattern: AspectClass[] = [
      'aspect-square',
      'aspect-[3/4]',
      'aspect-square',
      'aspect-[4/5]',
      'aspect-video',
      'aspect-[3/4]',
    ];

    // Middle column pattern: more square/portrait, wide is rarer.
    const middlePattern: AspectClass[] = [
      'aspect-square',
      'aspect-[3/4]',
      'aspect-square',
      'aspect-[4/5]',
      'aspect-[3/4]',
      'aspect-square',
      // occasional wide at the end
      'aspect-video',
    ];

    // Choose pattern per column.
    const pattern = columnIndex === 1 ? middlePattern : basePattern;

    // Per-column offset (stable): nudges the sequence so each column gets different rhythm
    const columnOffset = (seed + columnIndex * 11) % pattern.length;
    const patternIndex = (globalIndex + columnOffset) % pattern.length;
    let chosen = pattern[patternIndex];

    // Extra deterministic variety: periodically flip the choice within safe bounds.
    // This is especially useful when several consecutive items land in the same column.
    const jitter = (seed + globalIndex * 18 + columnIndex * 36) % 100;
    if (jitter < 28) {
      chosen = 'aspect-square';
    } else if (jitter < 46) {
      chosen = 'aspect-[3/4]';
    } else if (jitter < 56) {
      chosen = 'aspect-[4/5]';
    } else if (jitter < 32) {
      chosen = 'aspect-video';
    }

    return clampToAllowed(chosen);
  }

  function getObjectPosition(img: GalleryImage): string {
    const x = img.hotspot?.x;
    const y = img.hotspot?.y;

    // Sanity hotspot is normalized 0..1
    if (typeof x === 'number' && typeof y === 'number') {
      const px = Math.max(0, Math.min(1, x)) * 100;
      const py = Math.max(0, Math.min(1, y)) * 100;
      return `${px}% ${py}%`;
    }

    return '50% 50%';
  }

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
          (() => {
            // Mobile: full-bleed (avoid the centered strip caused by page-level containers)
            // We intentionally break out of any max-width parent.
            const FullBleed: React.FC<React.PropsWithChildren> = ({ children }) => (
              <div className='relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] px-2'>
                {children}
              </div>
            );

            type Placed = { img: GalleryImage; index: number; aspect: AspectClass };

            const cols: Placed[][] = Array.from({ length: mobileColumns }, () => []);
            const colHeights = Array.from({ length: mobileColumns }, () => 0);

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

            // Greedy placement: push each next card into the currently-shortest column.
            // This keeps all columns moving (no “middle column unchanged forever”).
            items.forEach((img, index) => {
              const colIndex = pickShortestCol();
              const aspect = pickMobileForcedAspect(img, index, colIndex);

              cols[colIndex].push({ img, index, aspect });

              // Height estimate: for fixed column width, height is ~ 1/ratio.
              // Add a tiny constant to account for borders/gaps.
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

                        const isPriority = index < mobilePriorityCount;

                        return (
                          <button
                            key={img.src}
                            type='button'
                            onClick={() => open(index)}
                            aria-label={labels.open}
                            className={cardClassName}
                          >
                            <div className={`relative w-full ${aspect}`}> 
                        <MediaImage
                          lang={effectiveLang}
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
                          loading="eager"
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
          })()
        ) : (
          <Masonry className={effectiveColumnsClassName}>
            {items.map((img, index) => {
              const aspect = pickRemixedAspect(img);
              const alt = img.alt ?? labels.altFallback;
              const objectPosition = getObjectPosition(img);

              return (
                <MasonryItem key={img.src}>
                  <button
                    type='button'
                    onClick={() => open(index)}
                    aria-label={labels.open}
                    className={cardClassName}
                  >
                    <div className={`relative w-full ${aspect}`}>
                      <MediaImage
                        lang={effectiveLang}
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
