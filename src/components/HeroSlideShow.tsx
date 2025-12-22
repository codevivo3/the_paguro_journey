'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

type HeroSlideShowProps = {
  /** Image paths under /public, e.g. "/hero/slide-1.jpg" */
  images?: string[];
  /** Milliseconds each slide stays visible */
  intervalMs?: number;
  /** Milliseconds for the fade transition */
  transitionMs?: number;
  /** Optional overlay to improve text contrast */
  overlay?: boolean;
  /** Extra classes for the outer wrapper */
  className?: string;
};

export default function HeroSlideShow({
  images,
  intervalMs = 5500,
  transitionMs = 900,
  overlay = false,
  className = '',
}: HeroSlideShowProps) {
  // Default images (replace with your real paths in /public)
  const slides = useMemo(
    () =>
      images && images.length
        ? images
        : [
            '/hero_slide_show/slide-1.jpg',
            '/hero_slide_show/slide-2.jpg',
            '/hero_slide_show/slide-3.jpg',
            '/hero_slide_show/slide-4.jpg',
            '/hero_slide_show/slide-5.jpg',
          ],
    [images]
  );

  const safeSlides = slides.filter(Boolean);
  const hasSlides = safeSlides.length > 0;

  const [index, setIndex] = useState(0);

  // Clamp index during render to avoid out-of-range access
  const safeIndex = safeSlides.length ? index % safeSlides.length : 0;

  // Loop slides
  useEffect(() => {
    
    if (!hasSlides || safeSlides.length === 1) return;
    
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % safeSlides.length);
    }, intervalMs);
    
    return () => window.clearInterval(id);
  }, [hasSlides, safeSlides.length, intervalMs]);
  
  if (!hasSlides) {
    // Fail-safe: avoid crashing if paths are missing
    return (
      <div
        className={`relative w-full h-screen bg-black ${className}`}
        aria-label='Hero slideshow'
      />
    );
  }

  return (
    <section
      className={`relative w-full h-screen overflow-hidden ${className}`}
      aria-label='Hero slideshow'
    >
      {/* Slides */}
      {safeSlides.map((src, i) => {
        const isActive = i === safeIndex;
        return (
          <div
            key={`${src}-${i}`}
            className={
              'absolute inset-0 transition-opacity ease-in-out ' +
              (isActive ? 'opacity-100' : 'opacity-0')
            }
            style={{ transitionDuration: `${transitionMs}ms` }}
            aria-hidden={!isActive}
          >
            <Image
              src={src}
              alt='' // decorative (hero content text is rendered in HTML elsewhere)
              fill
              priority={i === 0}
              sizes='100vw'
              className='object-cover'
            />
          </div>
        );
      })}

      {/* Optional contrast overlay */}
      {overlay && (
        <div
          className='absolute inset-0 z-10 bg-gradient-to-b from-black/35 via-black/35 to-black/60'
          aria-hidden='true'
        />
      )}

      {/* Optional "hidden" H1 for SEO can live in the page component, not here */}
    </section>
  );
}
