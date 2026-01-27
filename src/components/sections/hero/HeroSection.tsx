'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from 'react';

import Image from 'next/image';

import { useUI } from '@/context/ui-context';
import HeroSlideControls from './HeroSlideControls';

const SWIPE_THRESHOLD_PX = 45;

type HeroSlideShowProps = {
  /** Hero slides (preferably fetched from Sanity). */
  slides?: Array<{
    src: string;
    alt?: string;
    /** Optional base64 blur placeholder (blur-up). */
    blurDataURL?: string;
  }>;
  /** Milliseconds each slide stays visible */
  intervalMs?: number;
  /** Milliseconds for the fade transition */
  transitionMs?: number;
  /** Optional overlay to improve text contrast */
  overlay?: boolean;
  /** Extra classes for the outer wrapper */
  className?: string;
};

export default function HeroSection({
  slides,
  intervalMs = 5500,
  transitionMs = 1000,
  overlay = false,
  className = '',
}: HeroSlideShowProps) {
  // Slides are provided by the parent (source-of-truth: Sanity).
  // We only normalize/validate here to keep this component purely presentational.
  const safeSlides = useMemo(
    () =>
      (slides ?? []).filter(
        (s) => typeof s?.src === 'string' && s.src.length > 0,
      ),
    [slides],
  );

  const slideCount = safeSlides.length;
  const hasSlides = slideCount > 0;

  const { isSearchOpen } = useUI();

  const [index, setIndex] = useState(0);

  // Swipe support (mobile / trackpad)
  const [isInteracting, setIsInteracting] = useState(false);
  const startXRef = useRef<number | null>(null);

  // Pause autoplay while overlays are open or the user is interacting.
  const isPaused = isSearchOpen || isInteracting;

  const goTo = useCallback(
    (next: number) => {
      if (slideCount === 0) return;
      setIndex(((next % slideCount) + slideCount) % slideCount);
    },
    [slideCount],
  );

  const goNext = useCallback(() => {
    setIndex((prev) => {
      if (slideCount === 0) return prev;
      const next = prev + 1;
      return ((next % slideCount) + slideCount) % slideCount;
    });
  }, [slideCount]);

  const goPrev = useCallback(() => {
    setIndex((prev) => {
      if (slideCount === 0) return prev;
      const next = prev - 1;
      return ((next % slideCount) + slideCount) % slideCount;
    });
  }, [slideCount]);

  // Clamp index during render to avoid out-of-range access
  const safeIndex = slideCount ? index % slideCount : 0;

  // Autoplay slides (paused while Search modal is open or user is swiping)
  useEffect(() => {
    if (isPaused) return;
    if (!hasSlides) return;

    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slideCount);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isPaused, hasSlides, slideCount, intervalMs]);

  const onPointerDown = useCallback((e: PointerEvent) => {
    setIsInteracting(true);
    startXRef.current = e.clientX;
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const startX = startXRef.current;
      startXRef.current = null;
      setIsInteracting(false);

      if (startX == null) return;

      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;

      // Swipe left → next. Swipe right → prev.
      if (deltaX < 0) goNext();
      else goPrev();
    },
    [goNext, goPrev],
  );

  const onPointerCancel = useCallback(() => {
    startXRef.current = null;
    setIsInteracting(false);
  }, []);

  if (!hasSlides) {
    // Fail-safe: avoid crashing if paths are missing
    return (
      <div
        className={`relative w-full h-[100svh] bg-black overflow-hidden ${className}`}
        aria-label='Hero slideshow'
      />
    );
  }

  // Full-viewport hero: <Image fill /> only fills a parent with an explicit height.
  return (
    <section
      className={`group relative w-full h-[100svh] overflow-hidden select-none touch-pan-y ${className}`}
      aria-label='Hero slideshow'
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
    >
      {/* Slides (full-viewport cinematic hero) */}
      <div className='absolute inset-0 bg-black overflow-hidden'>
        <div
          className='flex h-full w-full transition-transform ease-in-out motion-reduce:transition-none'
          style={{
            transform: `translateX(-${safeIndex * 100}%)`,
            transitionDuration: `${transitionMs}ms`,
          }}
        >
          {safeSlides.map((slide, i) => (
            <div
              key={`${slide.src}-${i}`}
              className='relative h-full w-full shrink-0'
            >
              <Image
                src={slide.src}
                alt={slide.alt ?? ''}
                fill
                priority={i === 0}
                sizes='100vw'
                className='object-cover'
                loading={i === 0 ? 'eager' : 'lazy'}
                placeholder={slide.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={slide.blurDataURL}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Optional contrast overlay */}
      {overlay && (
        <div
          className='pointer-events-none absolute inset-0'
          aria-hidden='true'
        />
      )}
      {/* Optional "hidden" H1 for SEO can live in the page component, not here */}
      <HeroSlideControls
        count={slideCount}
        activeIndex={safeIndex}
        onPrev={goPrev}
        onNext={goNext}
        onSelect={goTo}
      />
    </section>
  );
}
