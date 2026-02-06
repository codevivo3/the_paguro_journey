import Image from 'next/image';

import type { HomeDividerData } from '@/sanity/queries/homeDivider';
import { pickLang } from '@/lib/pickLang';
import { safeLang, type Lang } from '@/lib/route';

import RichText from '@/components/shared/RichText';


export function getBreakImageProps(homeDivider: HomeDividerData, lang: Lang) {
  const desktop = homeDivider?.mediaDesktop ?? homeDivider?.media;

  const mobile = homeDivider?.mediaMobile;

  // We always require a desktop image as the baseline.
  if (!desktop?.imageUrl) return null;

  // If mobile is not set, we will fall back to desktop for mobile rendering.
  const mobileEffective = mobile ?? desktop;

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

  const dividerAltDesktop =
    overrideAlt ||
    desktop.altA11yResolved?.trim() ||
    desktop.alt?.trim() ||
    (lang === 'en' ? 'Homepage divider image' : 'Immagine divisore homepage');

  const dividerAltMobile =
    overrideAlt ||
    mobileEffective.altA11yResolved?.trim() ||
    mobileEffective.alt?.trim() ||
    dividerAltDesktop;

  return {
    lang,
    srcDesktop: desktop.imageUrl,
    srcMobile: mobile?.imageUrl,

    // Keep separate alts/titles/captions so mobile doesn't accidentally show desktop text.
    altDesktop: dividerAltDesktop,
    altMobile: dividerAltMobile,

    titleDesktop: desktop.titleResolved,
    titleMobile: mobileEffective.titleResolved,

    captionDesktop: desktop.captionResolved,
    captionMobile: mobileEffective.captionResolved,

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

  // Alt can differ if mobile uses different media.
  altDesktop: string;
  altMobile: string;

  /** Optional Sanity‑resolved copy (can differ per breakpoint) */
  titleDesktop?: string;
  titleMobile?: string;
  eyebrow?: string;
  captionDesktop?: string;
  captionMobile?: string;

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
  altDesktop,
  altMobile,
  titleDesktop,
  titleMobile,
  eyebrow,
  captionDesktop,
  captionMobile,
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

  const resolvedCaptionMobile = captionMobile;
  const resolvedCaptionDesktop = captionDesktop;

  // Titles can differ per breakpoint (mobile media vs desktop media).
  // Priority: explicit titleX → captionX → meta.title
  const resolvedTitleMobile = titleMobile ?? resolvedCaptionMobile ?? meta?.title;
  const resolvedTitleDesktop = titleDesktop ?? resolvedCaptionDesktop ?? meta?.title;

  const titleMobileIsFromCaption = !titleMobile && Boolean(resolvedCaptionMobile);
  const titleDesktopIsFromCaption = !titleDesktop && Boolean(resolvedCaptionDesktop);

  const contentBlock = (
    <>
      {resolvedTitleMobile || resolvedTitleDesktop || resolvedEyebrow || meta?.credit ? (
        <header className='px-6 mb-4 md:mb-6 text-center md:text-left'>
          {(resolvedTitleMobile || resolvedTitleDesktop) ? (
            <>
              {/* Mobile */}
              {resolvedTitleMobile ? (
                <h3 className='t-section-title title-divider title-divider-center md:hidden'>
                  {resolvedTitleMobile}
                </h3>
              ) : null}

              {/* Desktop */}
              {resolvedTitleDesktop ? (
                <h3 className='t-section-title title-divider hidden md:block'>
                  {resolvedTitleDesktop}
                </h3>
              ) : null}
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
              alt={altMobile}
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
              alt={altDesktop}
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

        {/* Mobile caption */}
        {resolvedCaptionMobile && !titleMobileIsFromCaption && resolvedCaptionMobile !== resolvedTitleMobile ? (
          <figcaption className='t-meta mt-2 md:mt-3 text-center md:text-left md:hidden'>
            {resolvedCaptionMobile}
          </figcaption>
        ) : null}

        {/* Desktop caption */}
        {resolvedCaptionDesktop && !titleDesktopIsFromCaption && resolvedCaptionDesktop !== resolvedTitleDesktop ? (
          <figcaption className='t-meta mt-2 md:mt-3 text-center md:text-left hidden md:block'>
            {resolvedCaptionDesktop}
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
            // Prefer mobile copy first (better match on phones), otherwise fall back to desktop.
            resolvedCaptionMobile
              ? `${fallback.ariaOpen}: ${resolvedCaptionMobile}`
              : resolvedTitleMobile
                ? `${fallback.ariaOpen}: ${resolvedTitleMobile}`
                : resolvedCaptionDesktop
                  ? `${fallback.ariaOpen}: ${resolvedCaptionDesktop}`
                  : resolvedTitleDesktop
                    ? `${fallback.ariaOpen}: ${resolvedTitleDesktop}`
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