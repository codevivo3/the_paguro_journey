type Lang = 'it' | 'en';

type HeroVideoProps = {
  lang?: Lang;

  /** Optional Sanity-resolved aria-label override */
  ariaLabel?: string;
};

export default function HeroVideo({ lang = 'it', ariaLabel }: HeroVideoProps) {
  const labels = {
    it: 'Video hero decorativo',
    en: 'Decorative hero video',
  } as const;

  const fallback = labels[lang];
  const resolvedAriaLabel = ariaLabel ?? fallback;

  return (
    <video
      aria-label={resolvedAriaLabel}
      autoPlay
      muted
      loop
      playsInline
      className='w-full h-screen object-cover overflow-hidden'
    >
      <source src='/hero_video_sample.mp4' type='video/mp4' />
    </video>
  );
}
