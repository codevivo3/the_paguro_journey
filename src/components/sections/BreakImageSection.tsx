import type { HomeDividerData } from '@/sanity/queries/homeDivider';
import { pickLang } from '@/lib/pickLang';

export function getBreakImageProps(
  homeDivider: HomeDividerData,
  lang: Lang,
) {
  if (!homeDivider?.media?.imageUrl) return null;

  const dividerAlt =
    homeDivider.altOverride?.trim() ||
    homeDivider.media.alt?.trim() ||
    (lang === 'en' ? 'Homepage divider image' : 'Immagine divisore homepage');

  return {
    lang,
    src: homeDivider.media.imageUrl,
    alt: dividerAlt,
    title: homeDivider.media.titleResolved,
    eyebrow: pickLang(homeDivider.eyebrow, lang),
    content: pickLang(homeDivider.dividerContent, lang),
    href: homeDivider.link ?? undefined,
    meta: {
      id: homeDivider.media._id,
      type: 'mediaItem' as const,
      title: homeDivider.media.title,
      credit: homeDivider.media.credit,
    },
  };
}
import Image from 'next/image';
import { safeLang, type Lang } from '@/lib/route';
import RichText from '@/components/shared/RichText';

type BreakImageSectionProps = {
  lang: Lang;

  /** Image */
  src: string;
  alt: string;

  /** Optional Sanity‑resolved copy */
  title?: string;
  eyebrow?: string;
  caption?: string | { it?: string; en?: string };

  /** Optional rich text shown under the image (Sanity: homeDivider.dividerContent) */
  content?: unknown;

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
  content,
  href,
  priority = false,
  className,
  meta,
}: BreakImageSectionProps) {
  const effectiveLang: Lang = safeLang(lang);
  const contentI18n = {
    it: {
      ariaOpen: 'Apri immagine',
      eyebrow: 'riflessione',
    },
    en: {
      ariaOpen: 'Open image',
      eyebrow: 'reflection',
    },
  } as const;

  const fallback = contentI18n[effectiveLang];

  const resolvedEyebrow = eyebrow ?? fallback.eyebrow;
  const resolvedCaption =
    typeof caption === 'string'
      ? caption
      : effectiveLang === 'en'
        ? caption?.en ?? caption?.it
        : caption?.it ?? caption?.en;

  // We want the visible title to switch by language.
  // Priority: explicit `title` prop → resolved bilingual caption → meta.title (fallback).
  const resolvedTitle = title ?? resolvedCaption ?? meta?.title;

  // If the title is coming from the caption, don't render the same text again as figcaption.
  const titleIsFromCaption = !title && Boolean(resolvedCaption);

  const contentBlock = (
    <>
      {resolvedTitle || resolvedEyebrow || meta?.credit ? (
        <header className='mb-4 md:mb-6 text-center md:text-left'>
          {resolvedTitle ? (
            <h3 className='t-section-title title-divider'>{resolvedTitle}</h3>
          ) : null}
          {resolvedEyebrow ? <p className='t-meta mt-1'>{resolvedEyebrow}</p> : null}
        </header>
      ) : null}
      <figure
        data-id={meta?.id}
        data-type={meta?.type}
        data-title={meta?.title}
        data-credit={meta?.credit}
        className={['relative overflow-hidden rounded-sm', className]
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

        {Array.isArray(content) && content.length > 0 ? (
          <div className='t-body mt-3 md:mt-4 text-sm md:text-base text-left md:text-justify'>
            <RichText value={content} />
          </div>
        ) : null}

        {resolvedCaption && !titleIsFromCaption && resolvedCaption !== resolvedTitle ? (
          <figcaption className='t-meta mt-2 md:mt-3 text-center md:text-left'>
            {resolvedCaption}
          </figcaption>
        ) : null}

        {meta?.credit ? (
          <div className='t-meta mt-1 text-xs text-center md:text-left'>© {meta.credit}</div>
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
          aria-label={
            resolvedCaption
              ? `${fallback.ariaOpen}: ${resolvedCaption}`
              : resolvedTitle
                ? `${fallback.ariaOpen}: ${resolvedTitle}`
                : fallback.ariaOpen
          }
        >
          {contentBlock}
        </a>
      ) : (
        contentBlock
      )}
    </section>
  );
}