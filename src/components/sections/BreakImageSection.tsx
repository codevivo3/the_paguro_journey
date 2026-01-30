import Image from 'next/image';
import { safeLang, type Lang } from '@/lib/route';

type BreakImageSectionProps = {
  lang?: Lang;

  /** Image */
  src: string;
  alt: string;

  /** Optional Sanity‑resolved copy */
  title?: string;
  eyebrow?: string;
  caption?: string;

  href?: string;
  priority?: boolean;
  className?: string;

  /** Optional metadata (editorial / analytics / Sanity-friendly) */
  meta?: {
    id?: string;
    type?: 'mediaItem' | 'image' | 'photo';
    title?: string;
    credit?: string;
  };
};

export default function BreakImageSection({
  lang,
  src,
  alt,
  title,
  eyebrow,
  caption,
  href,
  priority = false,
  className,
  meta,
}: BreakImageSectionProps) {
  const effectiveLang: Lang = safeLang(lang);
  const contentI18n = {
    it: {
      fallbackTitle: 'Una citazione da un autore famoso…',
      eyebrow: 'riflessione',
      ariaOpen: 'Apri immagine',
    },
    en: {
      fallbackTitle: 'A quote from a famous writer…',
      eyebrow: 'reflection',
      ariaOpen: 'Open image',
    },
  } as const;

  const fallback = contentI18n[effectiveLang];

  const resolvedTitle = title ?? meta?.title ?? fallback.fallbackTitle;
  const resolvedEyebrow = eyebrow ?? fallback.eyebrow;

  const content = (
    <>
      {meta?.title || meta?.credit ? (
        <header className="mb-4 md:mb-6 text-center md:text-left">
          <h3 className="t-section-title title-divider">
            {resolvedTitle}
          </h3>
          <p className="t-meta mt-1">
            {resolvedEyebrow}
          </p>
        </header>
      ) : null}
      <figure
        data-id={meta?.id}
        data-type={meta?.type}
        data-title={meta?.title}
        data-credit={meta?.credit}
        className={[
          'relative overflow-hidden rounded-sm',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className='relative aspect-[4/5] md:aspect-[16/9] overflow-hidden rounded-sm'>
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className='object-cover'
            sizes='(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 768px'
          />
        </div>

        {caption ? (
          <figcaption className='t-meta mt-2 md:mt-3 text-center md:text-left'>
            {caption}
          </figcaption>
        ) : null}

        {meta?.credit ? (
          <div className='t-meta mt-1 text-xs text-center md:text-left'>
            © {meta.credit}
          </div>
        ) : null}
      </figure>
    </>
  );

  return (
    <section className='mx-auto w-full max-w-3xl pt-12 pb-8 md:pt-16 md:pb-10'>
      {href ? (
        <a
          href={href}
          className='block outline-none focus-visible:ring-1 focus-visible:ring-white/50'
          aria-label={caption ? `${fallback.ariaOpen}: ${caption}` : fallback.ariaOpen}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
}