'use client';

import * as React from 'react';
import Image, { type ImageProps } from 'next/image';


type MediaImageProps = Omit<
  ImageProps,
  'onLoadingComplete' | 'onError' | 'alt'
> & {
  /** Optional alt text. If omitted, we fall back to empty string (decorative). */
  alt?: string;
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
  alt = '',
  retry = true,
  retryAriaLabel = 'Riprova a caricare l’immagine',
  retryLabel = 'Riprova',
  wrapperClassName = '',
  className = '',
  onLoaded,
  ...imgProps
}: MediaImageProps) {
  const [loaded, setLoaded] = React.useState(false);
  const [errored, setErrored] = React.useState(false);
  const [attempt, setAttempt] = React.useState(0);

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
  }, [imgProps.src]);

  const handleLoaded = () => {
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
      className={`${wrapperBase} isolate h-full w-full overflow-hidden rounded-[inherit] ${wrapperClassName}`}
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
            aria-label={retryAriaLabel}
            className='rounded-full border border-black/10 bg-white/80 px-3 py-1 text-xs font-semibold text-black shadow-sm backdrop-blur-sm hover:bg-white'
          >
            {retryLabel}
          </button>
        </div>
      )}

      {/* Image layer */}
      <div className='absolute inset-0 z-10'>
        <Image
          key={attempt}
          {...imgProps}
          alt={alt}
          className={`h-full w-full transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          onLoadingComplete={handleLoaded}
          onError={handleError}
        />
      </div>
    </div>
  );
}
