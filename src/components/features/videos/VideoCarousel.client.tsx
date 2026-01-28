'use client';

import { useEffect, useRef, useState } from 'react';

import type { YouTubeVideo } from '@/lib/youtube/youtube';
import { useCarouselFades } from './useCarouselFades';
import VideoCardClient from '@/components/features/videos/VideoCardClient';

// Refs (no re-renders):
// - scrollerRef: horizontal scroll container
// - holdRef: manages RAF loop for hold-to-scroll
export default function VideoCarousel({ videos }: { videos: YouTubeVideo[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const holdRef = useRef<{ raf: number; dir: -1 | 0 | 1 }>({ raf: 0, dir: 0 });

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Arrow styling is shared with Hero arrows via CSS vars in globals.css.
  const arrowBase = `
    absolute top-1/2 z-50 -translate-y-1/2
    rounded-full px-2 py-2
    text-white backdrop-blur-md
    transition duration-300 ease-out
    hover:scale-[1.06] active:scale-[0.96]
  `;

  const arrowBg = `
    bg-[color:var(--carousel-arrow-bg)]
    hover:bg-[color:var(--carousel-arrow-bg-hover)]
    active:bg-[color:var(--carousel-arrow-bg-active)]

    ring-1 ring-[color:var(--carousel-arrow-ring)]
    hover:ring-[color:var(--carousel-arrow-ring-hover)]

    shadow-[0_14px_40px_rgba(0,0,0,0.18)]
    transition-colors
  `;

  // Fade gradients depend on scroll position — pass the ref object (not .current).
  const { fadeClass, recalc } = useCarouselFades(scrollerRef);

  // Refs to each card wrapper, used to compute and scroll to the centered card.
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  function getCenteredIndex(): number {
    const el = scrollerRef.current;
    if (!el) return 0;

    const centerX = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((node, i) => {
      if (!node) return;
      const nodeCenter = node.offsetLeft + node.offsetWidth / 2;
      const dist = Math.abs(nodeCenter - centerX);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    });

    return bestIdx;
  }

  function scrollToIndex(index: number, behavior: ScrollBehavior = 'smooth') {
    const el = scrollerRef.current;
    const node = cardRefs.current[index];
    if (!el || !node) return;

    const target = node.offsetLeft + node.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior });

    // Keep fades + arrow visibility in sync after programmatic scroll.
    window.setTimeout(() => recalc(), 220);
    window.setTimeout(() => updateArrowState(), 240);
  }

  function updateArrowState() {
    const el = scrollerRef.current;
    if (!el) return;

    if (videos.length <= 1) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const centered = getCenteredIndex();

    // Arrow visibility is based on the currently centered card.
    // Mobile: hide LEFT when index 0 is centered.
    // md+:   hide LEFT when index 1 is centered.
    const isMdUp = window.matchMedia('(min-width: 768px)').matches;
    const leftHideIndex = isMdUp ? 1 : 0;

    setCanScrollLeft(centered > leftHideIndex);

    if (isMdUp) {
      // Desktop: hide RIGHT when index (length - 2) is centered
      setCanScrollRight(centered < videos.length - 2);
    } else {
      // Mobile: hide RIGHT when the last card is centered
      setCanScrollRight(centered < videos.length - 1);
    }
  }

  // Discrete step: center the previous/next card.
  function step(dir: -1 | 1) {
    const current = getCenteredIndex();
    const next = Math.max(0, Math.min(videos.length - 1, current + dir));
    scrollToIndex(next);
  }

  // Hold-to-scroll: continuous scroll while pointer is held down.
  function startHold(dir: -1 | 1) {
    if (holdRef.current.raf) cancelAnimationFrame(holdRef.current.raf);
    holdRef.current.dir = dir;

    const tick = () => {
      const el = scrollerRef.current;
      if (!el || !holdRef.current.dir) return;

      el.scrollLeft += holdRef.current.dir * 14;
      recalc();
      holdRef.current.raf = requestAnimationFrame(tick);
    };

    holdRef.current.raf = requestAnimationFrame(tick);
  }

  // Stop hold-to-scroll and recompute fades.
  function stopHold() {
    holdRef.current.dir = 0;
    if (holdRef.current.raf) cancelAnimationFrame(holdRef.current.raf);
    holdRef.current.raf = 0;
    recalc();
    updateArrowState();
  }

  // Cleanup: ensure any active hold-to-scroll RAF is cancelled on unmount.
  useEffect(() => {
    return () => stopHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial positioning (and when list length changes):
  // - Mobile: start centered on card 0
  // - md+: start centered on card 1 (keeps the carousel “in motion” on desktop)
  // Use 'auto' to avoid an initial animation.
  useEffect(() => {
    if (videos.length === 0) return;

    const isMdUp = window.matchMedia('(min-width: 768px)').matches;
    const initialIndex = isMdUp && videos.length > 1 ? 1 : 0;

    scrollToIndex(initialIndex, 'auto');
    window.setTimeout(() => recalc(), 0);

    // Also adjust if the viewport crosses the md breakpoint (e.g., rotate device).
    const mql = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      const mdUp = mql.matches;
      const idx = mdUp && videos.length > 1 ? 1 : 0;
      scrollToIndex(idx, 'auto');
      window.setTimeout(() => recalc(), 0);
    };

    // Safari fallback: addListener/removeListener
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    }

    mql.addListener(onChange);
    return () => {
      mql.removeListener(onChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length]);

  // Keep arrow visibility updated while the user scrolls/drags.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let raf = 0;

    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        updateArrowState();
      });
    };

    // Initial state after layout.
    raf = requestAnimationFrame(() => updateArrowState());

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length]);

  return (
    <div className='-mx-6 px-6'>
      <div className='relative bg-[color:var(--paguro-bg)]'>
        {/* LEFT ARROW */}
        <button
          type='button'
          aria-label='Scorri a sinistra'
          className={`${arrowBase} ${arrowBg} left-2 ${
            canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            startHold(-1);
          }}
          onPointerUp={stopHold}
          onPointerCancel={stopHold}
          onPointerLeave={stopHold}
          onClick={() => step(-1)}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            className='size-8'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M15.75 19.5 8.25 12l7.5-7.5'
            />
          </svg>
        </button>

        {/* RIGHT ARROW */}
        <button
          type='button'
          aria-label='Scorri a destra'
          className={`${arrowBase} ${arrowBg} right-2 ${
            canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onPointerDown={(e) => {
            e.preventDefault();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            startHold(1);
          }}
          onPointerUp={stopHold}
          onPointerCancel={stopHold}
          onPointerLeave={stopHold}
          onClick={() => step(1)}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth={2}
            className='size-8'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m8.25 4.5 7.5 7.5-7.5 7.5'
            />
          </svg>
        </button>

        {/* SCROLLER */}
        <div
          ref={scrollerRef}
          className='relative z-0 flex gap-6 overflow-x-auto pb-4 scroll-smooth no-scrollbar pl-0 pr-0 md:pl-16 md:pr-16 lg:pl-24 lg:pr-24'
          aria-label='Ultimi video'
        >
          {/* Mobile-only spacers: let the first/last cards reach true centered positions */}
          <div aria-hidden className='shrink-0 w-[7.5%] sm:w-[15%] md:hidden' />

          {videos.map((video, i) => (
            <div
              key={video.id}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className='shrink-0 w-[80%] sm:w-[70%] md:w-[48%] lg:w-[32%]'
            >
              <VideoCardClient
                video={video}
                ariaLabel={`Guarda il video: ${video.title}`}
              />
            </div>
          ))}

          <div aria-hidden className='shrink-0 w-[7.5%] sm:w-[15%] md:hidden' />
        </div>

        {/* FADES */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 z-10 w-14 sm:w-18 lg:w-24 bg-gradient-to-r from-[color:var(--paguro-bg)] via-[color:var(--paguro-bg)]/45 to-transparent transition-opacity duration-200 ${fadeClass.left}`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 z-10 w-14 sm:w-18 lg:w-24 bg-gradient-to-l from-[color:var(--paguro-bg)] via-[color:var(--paguro-bg)]/45 to-transparent transition-opacity duration-200 ${fadeClass.right}`}
        />
      </div>
    </div>
  );
}
