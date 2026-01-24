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

type BlogCardClientProps = {
  /** Blog post URL */
  href: string;
  /** Optional aria label for the main card link */
  ariaLabel?: string;
  /** Cover image URL (already resolved to absolute/relative) */
  coverSrc: string;
  /** Title shown on card */
  title: string;
  /** Optional short excerpt */
  excerpt?: string;
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
  excerpt,
  meta,
  pill,
  pillHref,
  pillAriaLabel,
  mediaAspect = 'aspect-video',
}: BlogCardClientProps) {
  const [ready, setReady] = React.useState(false);

  return (
    <Card>
      {/* Media */}
      <Link
        href={href}
        aria-label={ariaLabel ?? `Apri articolo: ${title}`}
        className='block'
      >
        <CardMedia className={`${mediaAspect} relative`}>
          <MediaImage
            src={coverSrc}
            alt={title}
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
                {title}
              </CardTitle>
            </CardMetaRow>

            {excerpt ? (
              <p className='t-card-body clamp-4 mt-2'>{excerpt}</p>
            ) : null}

            <div className='mt-3 flex items-center justify-between'>
              <p className='t-meta'>{meta ?? ''}</p>
              {pill ? (
                <CardPill
                  href={pillHref}
                  ariaLabel={pillAriaLabel ?? 'Apri filtro'}
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
              Leggi <span aria-hidden>➜</span>
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
