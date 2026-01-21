'use client';

import { useEffect, useState } from 'react';

import Image from 'next/image';

import { useUI } from '@/context/ui-context';
import HeroSlideControls from './HeroSlideControls';

type HeroSlideShowProps = {
  /** Hero slides (preferably fetched from Sanity). */
  slides?: Array<{
    src: string;
    alt?: string;
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
  const safeSlides =
    (slides ?? []).filter((s) => typeof s?.src === 'string' && s.src.length > 0);
  const hasSlides = safeSlides.length > 0;

  const { isSearchOpen } = useUI();
  const isPaused = isSearchOpen;

  const [index, setIndex] = useState(0);

  const slideCount = safeSlides.length;

  const goTo = (next: number) => {
    setIndex(((next % slideCount) + slideCount) % slideCount);
  };

  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  // Clamp index during render to avoid out-of-range access
  const safeIndex = safeSlides.length ? index % safeSlides.length : 0;

  // Loop slides (pause while Search modal is open)
  useEffect(() => {
    if (isPaused) return;
    if (!hasSlides) return;

    const id = window.setInterval(() => {
      // Use safeSlides.length to stay consistent with filtering
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [isPaused, hasSlides, safeSlides.length, intervalMs]);

  if (!hasSlides) {
    // Fail-safe: avoid crashing if paths are missing
    return (
      <div
        className={`relative w-full h-screen bg-black ${className}`}
        aria-label='Hero slideshow'
      />
    );
  }

  // Full-viewport hero: <Image fill /> only fills a parent with an explicit height.
  return (
    <section
      className={`relative w-full h-[100svh] overflow-hidden ${className}`}
      aria-label='Hero slideshow'
    >
      {/* Slides (full-viewport cinematic hero) */}
      <div className='absolute inset-0 bg-black'>
        {safeSlides.map((slide, i) => {
          const isActive = i === safeIndex;
          return (
            <div
              key={`${slide.src}-${i}`}
              className={
                'absolute inset-0 transition-opacity ease-in-out ' +
                (isActive ? 'opacity-100' : 'opacity-0')
              }
              style={{ transitionDuration: `${transitionMs}ms` }}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={slide.alt ?? ''}
                fill
                priority={i === 0}
                sizes='100vw'
                className='object-cover'
              />
            </div>
          );
        })}
      </div>

      {/* Optional contrast overlay */}
      {overlay && (
        <div
          className='pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/55'
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
