import Image from 'next/image';

import type { HomeDividerData } from '@/sanity/queries/homeDivider';
import { pickLang } from '@/lib/pickLang';
import { safeLang, type Lang } from '@/lib/route';

import RichText from '@/components/shared/RichText';


export function getBreakImageProps(homeDivider: HomeDividerData, lang: Lang) {
  // Preferred: siteSettings.homeDivider.mediaDesktop / mediaMobile
  // Back-compat: siteSettings.homeDivider.media
  const desktop = homeDivider?.mediaDesktop ?? homeDivider?.media;
  const mobile = homeDivider?.mediaMobile;

  if (!desktop?.imageUrl) return null;

  const toTrimmedString = (v: unknown): string | undefined =>
    typeof v === 'string' ? v.trim() : undefined;

  // altOverride is bilingual in Site Settings (EN/IT).
  // Be defensive in case older data is still a string.
  const overrideAlt =
    toTrimmedString(homeDivider?.altOverride) ??
    toTrimmedString(
      pickLang(
        homeDivider?.altOverride as { it?: string; en?: string } | null | undefined,
        lang,
      ),
    );

  const dividerAlt =
    overrideAlt ||
    desktop.altA11yResolved?.trim() ||
    desktop.alt?.trim() ||
    (lang === 'en' ? 'Homepage divider image' : 'Immagine divisore homepage');

  return {
    lang,
    srcDesktop: desktop.imageUrl,
    srcMobile: mobile?.imageUrl,
    alt: dividerAlt,
    title: desktop.titleResolved,
    eyebrow: pickLang(homeDivider?.eyebrow, lang),
    content: pickLang(homeDivider?.dividerContent, lang),
    href: homeDivider?.link ?? undefined,
    meta: {
      id: desktop._id,
      type: 'mediaItem' as const,
      title: desktop.title,
      credit: desktop.credit,
    },
  };
}

type BreakImageSectionProps = {
  lang: Lang;

  /** Image */
  srcDesktop: string;
  srcMobile?: string;
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
  srcDesktop,
  srcMobile,
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
        <header className='px-6 mb-4 md:mb-6 text-center md:text-left'>
          {resolvedTitle ? (
            <>
              {/* Mobile: center the decorative divider */}
              <h3 className='t-section-title title-divider title-divider-center md:hidden'>
                {resolvedTitle}
              </h3>

              {/* Desktop: keep divider default (left) */}
              <h3 className='t-section-title title-divider hidden md:block'>
                {resolvedTitle}
              </h3>
            </>
          ) : null}
          {resolvedEyebrow ? <p className='t-meta mt-1'>{resolvedEyebrow}</p> : null}
        </header>
      ) : null}
      <figure
        data-id={meta?.id}
        data-type={meta?.type}
        data-title={meta?.title}
        data-credit={meta?.credit}
        className={['relative overflow-hidden rounded-sm max-w-3xl px-4 md:px-6', className]
          .filter(Boolean)
          .join(' ')}
      >
        <div className='relative overflow-hidden rounded-sm'>
          {/* Mobile image (if provided). Fallback to desktop image when missing. */}
          <div className='relative aspect-[4/5] overflow-hidden md:hidden'>
            <Image
              src={srcMobile ?? srcDesktop}
              alt={alt}
              fill
              priority={priority}
              className='object-cover'
              sizes='100vw'
            />
          </div>

          {/* Desktop image */}
          <div className='relative hidden aspect-[16/9] overflow-hidden md:block'>
            <Image
              src={srcDesktop}
              alt={alt}
              fill
              priority={priority}
              className='object-cover'
              sizes='(max-width: 1024px) 90vw, 768px'
            />
          </div>
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