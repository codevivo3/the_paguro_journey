'use client';

import { safeLang, type Lang } from '@/lib/route';

/**
 * Shared arrow icon for hero navigation.
 * Direction is controlled via rotation to avoid SVG duplication.
 */
function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth='2'
      stroke='currentColor'
      className={`size-9 md:size-8 ${direction === 'right' ? 'rotate-180' : ''}`}
      aria-hidden='true'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 19.5 8.25 12l7.5-7.5'
      />
    </svg>
  );
}

/**
 * Generic arrow button wrapper to keep markup DRY.
 * Visibility is handled via `group-hover` on the parent hero container.
 */
function ArrowButton({
  onClick,
  ariaLabel,
  className,
  direction,
}: {
  onClick: () => void;
  ariaLabel: string;
  className: string;
  direction: 'left' | 'right';
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      aria-label={ariaLabel}
      className={className}
    >
      <ArrowIcon direction={direction} />
    </button>
  );
}

type HeroSlideControlsProps = {
  lang?: Lang;
  count: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;

  /** Optional Sanity-resolved label overrides */
  prevLabel?: string;
  nextLabel?: string;
  /** Template supports `{n}` placeholder, e.g. "Go to slide {n}" */
  goToLabelTemplate?: string;
};

export default function HeroSlideControls({
  lang,
  count,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
  prevLabel,
  nextLabel,
  goToLabelTemplate,
}: HeroSlideControlsProps) {
  // No controls needed for a single (or missing) slide
  if (count <= 1) return null;

  const effectiveLang: Lang = safeLang(lang);

  const labels = {
    it: {
      prev: 'Immagine precedente',
      next: 'Immagine successiva',
      goTo: (n: number) => `Vai alla slide ${n}`,
    },
    en: {
      prev: 'Previous image',
      next: 'Next image',
      goTo: (n: number) => `Go to slide ${n}`,
    },
  } as const;

  const fallback = labels[effectiveLang];

  const resolvedPrev = prevLabel ?? fallback.prev;
  const resolvedNext = nextLabel ?? fallback.next;

  const resolvedGoTo = (n: number) => {
    if (goToLabelTemplate) return goToLabelTemplate.replace('{n}', String(n));
    return fallback.goTo(n);
  };

  // Base arrow layout + interaction behavior
  // - Hidden by default
  // - Revealed when the hero container is hovered (group-hover)
  const arrowBase =
    // Mobile: always visible + larger tap target
    'absolute top-1/2 z-20 -translate-y-1/2 rounded-full p-3 md:px-2 md:py-2 text-white ' +
    'backdrop-blur shadow-xl transition ' +
    // Mobile: visible/tappable; md+: hidden until hover
    'opacity-100 pointer-events-auto md:opacity-0 md:pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto ' +
    'duration-300 ease-out ' +
    'hover:scale-[1.05] active:scale-[0.95]';

  // Neutral, glassy background — no gradients, no theme coupling
  const arrowBg =
    'bg-white/5 ' +
    'hover:bg-white/10 active:bg-white/15 ' +
    'ring-1 ring-white/10 hover:ring-white/20 ' +
    'transition-colors';

  return (
    <>
      {/* Previous slide */}
      <ArrowButton
        onClick={onPrev}
        ariaLabel={resolvedPrev}
        direction='left'
        className={`${arrowBase} ${arrowBg} left-3 md:left-4`}
      />

      {/* Next slide */}
      <ArrowButton
        onClick={onNext}
        ariaLabel={resolvedNext}
        direction='right'
        className={`${arrowBase} ${arrowBg} right-3 md:right-4`}
      />

      {/* Slide indicators */}
      <div className='absolute bottom-4 md:bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3 md:gap-2'>
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            type='button'
            onClick={() => onSelect(i)}
            aria-label={resolvedGoTo(i + 1)}
            className={
              'h-2 w-7 md:h-1 md:w-5 rounded-full transition ' +
              (i === activeIndex
                ? 'bg-white/80'
                : 'bg-white/20 hover:bg-white/50')
            }
          />
        ))}
      </div>
    </>
  );
}
