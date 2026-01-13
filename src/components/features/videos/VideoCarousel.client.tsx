'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

import type { YouTubeVideo } from '@/lib/youtube';
import { cleanYouTubeDescription } from '@/lib/cleanYouTubeDescription';
import { useCarouselFades } from './useCarouselFades';

export default function VideoCarousel({ videos }: { videos: YouTubeVideo[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const holdRef = useRef<{ raf: number; dir: -1 | 0 | 1 }>({
    raf: 0,
    dir: 0,
  });

  // ✅ PASS THE REF — not scrollerRef.current
  const { fadeClass, recalc } = useCarouselFades(scrollerRef);

  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);

  function getCenteredIndex(): number {
    const el = scrollerRef.current;
    if (!el) return 0;

    const centerX = el.scrollLeft + el.clientWidth / 2;
    let bestIdx = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((node, i) => {
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

  function scrollToIndex(index: number) {
    const el = scrollerRef.current;
    const node = itemRefs.current[index];
    if (!el || !node) return;

    const target = node.offsetLeft + node.offsetWidth / 2 - el.clientWidth / 2;
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });

    // Ensure fades update even if the browser batches scroll events.
    window.setTimeout(() => recalc(), 220);
  }

  function step(dir: -1 | 1) {
    const current = getCenteredIndex();
    const next = Math.max(0, Math.min(videos.length - 1, current + dir));
    scrollToIndex(next);
  }

  // Continuous scrolling when holding arrow (stop anywhere)
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

  function stopHold() {
    holdRef.current.dir = 0;
    if (holdRef.current.raf) cancelAnimationFrame(holdRef.current.raf);
    holdRef.current.raf = 0;
    recalc();
  }

  useEffect(() => {
    return () => stopHold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='-mx-6 px-6'>
      <div className='relative bg-[color:var(--paguro-bg)]'>
        {/* LEFT ARROW */}
        <button
          type='button'
          aria-label='Scorri a sinistra'
          className='absolute left-2 top-1/2 z-50 -translate-y-1/2 rounded-full border border-black/20 bg-white/10 px-2 py-2 text-white backdrop-blur transition hover:bg-white/30'
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
          className='absolute right-2 top-1/2 z-50 -translate-y-1/2 rounded-full border border-black/20 bg-white/10 px-2 py-2 text-white backdrop-blur transition hover:bg-white/30'
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
          className='relative z-0 flex gap-6 overflow-x-auto pb-4 scroll-smooth pl-16 pr-16 sm:pl-20 sm:pr-20 lg:pl-24 lg:pr-24 no-scrollbar'
          aria-label='Ultimi video'
        >
          {videos.map((video, i) => (
            <div
              key={video.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className='shrink-0 w-[85%] sm:w-[70%] md:w-[48%] lg:w-[32%]'
            >
              <Card>
                <CardMedia className='aspect-video'>
                  <a
                    href={video.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`Guarda il video: ${video.title}`}
                    className='block relative h-full w-full'
                  >
                    <Image
                      src={video.thumbnail}
                      alt={video.title}
                      fill
                      sizes='(max-width: 768px) 85vw, (max-width: 1024px) 70vw, 33vw'
                      className='object-cover transition-transform duration-300 hover:scale-[1.02]'
                      quality={90}
                    />
                  </a>
                </CardMedia>

                <CardBody className='flex h-full flex-col'>
                  <CardTitle>{video.title}</CardTitle>
                  <CardText className='clamp-4'>
                    {cleanYouTubeDescription(video.description)}
                  </CardText>
                  <a
                    href={video.href}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 hover:text-[color:var(--paguro-link-hover)]'
                  >
                    Guarda il video <span aria-hidden>➜</span>
                  </a>
                </CardBody>
              </Card>
            </div>
          ))}
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
