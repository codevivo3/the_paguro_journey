'use client';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { urlFor } from '@/sanity/lib/image';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';
import { safeLang, type Lang } from '@/lib/route';

type SanityHotspot = {
  x?: number;
  y?: number;
  height?: number;
  width?: number;
};

type SanityCrop = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

type MediaImageProps = Omit<ImageProps, 'onLoad' | 'onError' | 'alt'> & {
  /** Optional language for default UI strings */
  lang?: Lang;
  /** Optional alt text. If omitted, we fall back to empty string (decorative). */
  alt?: string;
  /** Optional Sanity image source. If provided, MediaImage will build the final URL via `urlFor()` */
  sanityImage?: SanityImageSource;
  /** Optional Sanity hotspot for focal point-aware rendering */
  hotspot?: SanityHotspot | null;
  /** Optional Sanity crop data */
  crop?: SanityCrop | null;
  /** Show a small retry button overlay when the image fails to load */
  retry?: boolean;
  /** Accessible label for the retry button */
  retryAriaLabel?: string;
  /** Visible label for the retry button */
  retryLabel?: string;
  /** Optional className for the outer wrapper */
  wrapperClassName?: string;
  onLoaded?: () => void;
};

export default function MediaImage({
  lang,
  alt = '',
  sanityImage,
  hotspot,
  crop,
  retry = true,
  retryAriaLabel,
  retryLabel,
  wrapperClassName = '',
  className = '',
  onLoaded,
  ...imgProps
}: MediaImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

  const effectiveLang: Lang = safeLang(lang);

  const defaults = {
    it: {
      retryAriaLabel: 'Riprova a caricare l’immagine',
      retryLabel: 'Riprova',
    },
    en: {
      retryAriaLabel: 'Retry loading image',
      retryLabel: 'Retry',
    },
  } as const;

  const d = defaults[effectiveLang];
  const resolvedRetryAriaLabel = retryAriaLabel ?? d.retryAriaLabel;
  const resolvedRetryLabel = retryLabel ?? d.retryLabel;

  // If a Sanity image is provided, build a focal-point-aware URL.
  // This preserves the existing API: callers can still pass `src` directly.
  const baseSrc = imgProps.src;
  const baseWidth = imgProps.width;
  const baseQuality = imgProps.quality;

  const resolvedSrc = React.useMemo(() => {
    if (!sanityImage) return baseSrc;

    // Sanity image-url builder does NOT accept crop/hotspot objects via `.crop()` / `.hotspot()`.
    // Instead, we merge them into the image source itself (same shape Sanity uses on the image field)
    // and build the URL from that.
    const mergedSource = {
      ...(sanityImage as unknown as Record<string, unknown>),
      ...(crop ? { crop } : null),
      ...(hotspot ? { hotspot } : null),
    } as unknown as SanityImageSource;

    // Pick a sensible transform width/quality for Sanity.
    // - If a numeric width is provided, respect it.
    // - Otherwise default to 1600 (good balance for cards/galleries).
    const w = typeof baseWidth === 'number' ? baseWidth : 1600;
    const q = typeof baseQuality === 'number' ? baseQuality : 80;

    // When hotspot/crop exists we must request a crop transform so Sanity uses focal point data.
    // `crop('focalpoint')` uses the hotspot from the source; `fit('crop')` ensures it’s applied.
    let builder = urlFor(mergedSource).width(w).quality(q).auto('format');
    if (hotspot || crop) builder = builder.fit('crop').crop('focalpoint');

    return builder.url();
  }, [sanityImage, crop, hotspot, baseSrc, baseWidth, baseQuality]);

  // Skeleton lifecycle control
  const [skeletonMounted, setSkeletonMounted] = React.useState(true);
  const [skeletonFade, setSkeletonFade] = React.useState(false);

  // Reset loading state when src changes (important for navigation / re-renders)
  React.useEffect(() => {
    setLoaded(false);
    setErrored(false);
    setAttempt(0);
    setSkeletonMounted(true);
    setSkeletonFade(false);
  }, [resolvedSrc]);

  // iOS/Safari + portal/columns layouts can sometimes skip firing onLoad/onLoadingComplete.
  // For above-the-fold (priority) images, never keep them invisible forever.
  React.useEffect(() => {
    if (!imgProps.priority) return;

    const t = window.setTimeout(() => {
      // Only apply if we're still stuck.
      if (!loaded && !errored) {
        setLoaded(true);
        // also hide the skeleton so the UI doesn't look broken
        setSkeletonFade(true);
        window.setTimeout(() => setSkeletonMounted(false), 300);
      }
    }, 1200);

    return () => window.clearTimeout(t);
  }, [imgProps.priority, loaded, errored, resolvedSrc]);

  const handleLoaded = (_e?: unknown) => {
    setLoaded(true);
    onLoaded?.();

    // Ensure at least one paint before fading shimmer
    requestAnimationFrame(() => {
      setSkeletonFade(true);
      window.setTimeout(() => {
        setSkeletonMounted(false);
      }, 300);
    });
  };

  const handleError = () => {
    setLoaded(false);
    setErrored(true);
    setSkeletonMounted(false);
    setSkeletonFade(false);
  };

  const handleRetry = () => {
    setErrored(false);
    setLoaded(false);
    setSkeletonMounted(true);
    setSkeletonFade(false);
    setAttempt((n) => n + 1);
  };

  // If `fill` is used, outer wrapper must be absolute.
  const wrapperBase = imgProps.fill ? 'absolute inset-0' : 'relative';

  return (
    <div
      className={`${wrapperBase} isolate h-full w-full overflow-hidden rounded-[inherit] cursor-inherit ${wrapperClassName}`}
    >
      <style>{`
        @keyframes paguro-skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
      {/* Skeleton shimmer (real child element: .skeleton-shine) */}
      {skeletonMounted && !errored && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-[inherit] transition-opacity duration-300 ${
            skeletonFade ? 'opacity-0' : 'opacity-100'
          } bg-black/10 dark:bg-white/10`}
        >
          <div
            className='absolute inset-0'
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent)',
              animation: 'paguro-skeleton-shimmer 1.1s linear infinite',
              willChange: 'transform',
            }}
          />
        </div>
      )}

      {/* Error overlay */}
      {errored && retry && (
        <div className='absolute inset-0 z-30 grid place-items-center rounded-[inherit]'>
          <button
            type='button'
            onClick={handleRetry}
            aria-label={resolvedRetryAriaLabel}
            className='rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-black shadow-sm backdrop-blur-sm hover:bg-white'
          >
            {resolvedRetryLabel}
          </button>
        </div>
      )}

      {/* Image layer */}
      <div className='absolute inset-0 z-10 cursor-inherit'>
        <Image
          key={attempt}
          {...imgProps}
          src={resolvedSrc}
          alt={alt}
          style={{
            ...(imgProps.style ?? {}),
            ...(hotspot?.x != null && hotspot?.y != null
              ? { objectPosition: `${hotspot.x * 100}% ${hotspot.y * 100}%` }
              : null),
          }}
          className={`h-full w-full cursor-inherit transition-opacity duration-300 ${
            loaded || imgProps.priority ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoad={handleLoaded}
          onLoadingComplete={() => handleLoaded()}
          onError={handleError}
        />
      </div>
    </div>
  );
}
