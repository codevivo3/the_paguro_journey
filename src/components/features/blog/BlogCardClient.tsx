'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardMetaRow,
  CardPill,
} from '@/components/ui/Card';
import MediaImage from '@/components/features/media/MediaImage';
import { pickLang } from '@/lib/pickLang';
import { safeLang, type Lang } from '@/lib/route';

type BlogCardClientProps = {
  /** Blog post URL */
  href: string;
  /** Optional aria label for the main card link */
  ariaLabel?: string;
  /** Cover image URL (already resolved to absolute/relative) */
  coverSrc: string;
  /** Title shown on card */
  title: string;
  /** Optional bilingual title fields (if provided, can override empty `title`) */
  titleIt?: string | null;
  titleEn?: string | null;
  /** Optional short excerpt */
  excerpt?: string;
  /** Optional bilingual excerpt fields (if provided, can override empty `excerpt`) */
  excerptIt?: string | null;
  excerptEn?: string | null;
  /** Optional date/meta string (already formatted upstream) */
  meta?: string;
  /** Optional pill label (e.g. category/region/tag) */
  pill?: string;
  /** Optional pill link */
  pillHref?: string;
  /** Optional aria label for pill link */
  pillAriaLabel?: string;
  /** Aspect utility, e.g. 'aspect-video' or 'aspect-[3/4]' */
  mediaAspect?: string;
  /** Current language (required). Prevents accidental IT fallback on /en routes. */
  lang: Lang;
};

/**
 * BlogCardClient
 * Option A: whole card skeleton (media + body) until cover image loads.
 * Keeps the UI calm and avoids half-loaded cards.
 */
export default function BlogCardClient({
  href,
  ariaLabel,
  coverSrc,
  title,
  titleIt,
  titleEn,
  excerpt,
  excerptIt,
  excerptEn,
  meta,
  pill,
  pillHref,
  pillAriaLabel,
  mediaAspect = 'aspect-video',
  lang,
}: BlogCardClientProps) {
  const effectiveLang: Lang = safeLang(lang);
  const [ready, setReady] = React.useState(false);

  const labels = {
    it: {
      openAria: (title: string) => `Apri articolo: ${title}`,
      readMore: 'Leggi',
      openFilter: 'Apri filtro',
    },
    en: {
      openAria: (title: string) => `Open article: ${title}`,
      readMore: 'Read',
      openFilter: 'Open filter',
    },
  } as const;

  const t = labels[effectiveLang];

  const resolvedTitle =
    (title?.trim() || undefined) ??
    pickLang(effectiveLang, titleIt ?? undefined, titleEn ?? undefined) ??
    '';

  const resolvedExcerpt =
    (excerpt?.trim() || undefined) ??
    pickLang(effectiveLang, excerptIt ?? undefined, excerptEn ?? undefined);

  return (
    <Card>
      {/* Media */}
      <Link
        href={href}
        aria-label={ariaLabel ?? t.openAria(resolvedTitle)}
        className='block'
      >
        <CardMedia className={`${mediaAspect} relative`}>
          <MediaImage
            src={coverSrc}
            alt={resolvedTitle}
            fill
            sizes='(max-width: 1024px) 100vw, 33vw'
            className='object-cover transition-transform duration-300 hover:scale-[1.02]'
            onLoaded={() => setReady(true)}
          />
        </CardMedia>
      </Link>

      {/* Body */}
      <CardBody className='relative'>
        {/* Skeleton overlay (whole body) */}
        {!ready ? (
          <div className='space-y-3'>
            <div className='h-5 w-4/5 rounded-md skeleton' />
            <div className='h-4 w-3/5 rounded-md skeleton' />
            <div className='flex items-center justify-between pt-1'>
              <div className='h-3 w-24 rounded-md skeleton' />
              <div className='h-8 w-20 rounded-full skeleton' />
            </div>
            <div className='h-4 w-28 rounded-md skeleton' />
          </div>
        ) : (
          <div className='opacity-100 transition-opacity duration-300'>
            <CardMetaRow className='mb-2'>
              <CardTitle className='text-[1.15rem] leading-tight'>
                {resolvedTitle}
              </CardTitle>
            </CardMetaRow>

            {resolvedExcerpt ? (
              <p className='t-card-body clamp-4 mt-2'>{resolvedExcerpt}</p>
            ) : null}

            <div className='mt-3 flex items-center justify-between'>
              <p className='t-meta'>{meta ?? ''}</p>
              {pill ? (
                <CardPill
                  href={pillHref}
                  ariaLabel={pillAriaLabel ?? t.openFilter}
                  className='shrink-0'
                >
                  {pill}
                </CardPill>
              ) : null}
            </div>

            <Link
              href={href}
              className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] hover:text-[color:var(--paguro-link-hover)]'
            >
              {t.readMore} <span aria-hidden>➜</span>
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
