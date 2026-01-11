'use client';

type HeroSlideControlsProps = {
  count: number;
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
};

export default function HeroSlideControls({
  count,
  activeIndex,
  onPrev,
  onNext,
  onSelect,
}: HeroSlideControlsProps) {
  if (count <= 1) return null;

  return (
    <>
      {/* Slide navigation arrows (previous / next) */}
      <button
        onClick={onPrev}
        aria-label='Previous slide'
        className='absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full px-2 py-2 backdrop-blur bg-white/3 text-white  transition hover:bg-white/20'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='2'
          stroke='currentColor'
          className='size-8'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M15.75 19.5 8.25 12l7.5-7.5'
          />
        </svg>
      </button>

      <button
        onClick={onNext}
        aria-label='Next slide'
        className='absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/5 px-2 py-2 text-white backdrop-blur transition hover:bg-white/20'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='2'
          stroke='currentColor'
          className='size-8'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m8.25 4.5 7.5 7.5-7.5 7.5'
          />
        </svg>
      </button>

      {/* Slide indicators (one dot per slide) */}
      <div className='absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2'>
        {Array.from({ length: count }).map((_, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === activeIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </>
  );
}
