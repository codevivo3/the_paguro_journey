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

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-[inherit] ${className}`} />;
}

export function DestinationCardClient({
  href,
  regionHref,
  country,
  region,
  count,
  coverSrc,
  mediaAspect,
}: {
  href: string;
  regionHref: string;
  country: string;
  region: string;
  count: number;
  coverSrc: string;
  mediaAspect: string;
}) {
  const [ready, setReady] = React.useState(false);

  // keep skeleton visible even if the image loads instantly (cache)
  const MIN_SKELETON_MS = 250;
  const startedAtRef = React.useRef(0);

  React.useEffect(() => {
    setReady(false);
    startedAtRef.current = performance.now();
  }, [coverSrc]);

  const handleLoaded = React.useCallback(() => {
    const elapsed = performance.now() - startedAtRef.current;
    const remaining = Math.max(0, MIN_SKELETON_MS - elapsed);
    window.setTimeout(() => setReady(true), remaining);
  }, []);

  return (
    <Card>
      <Link
        href={href}
        aria-label={`Apri destinazione: ${country}`}
        className='block'
      >
        <CardMedia className={`${mediaAspect} relative`}>
          <MediaImage
            src={coverSrc}
            alt={country}
            fill
            sizes='(max-width: 1024px) 100vw, 33vw'
            className='object-cover transition-transform duration-300 hover:scale-[1.02]'
            onLoaded={handleLoaded}
          />
        </CardMedia>
      </Link>

      <CardBody>
        {!ready ? (
          <div className='space-y-3'>
            <SkeletonBlock className='h-5 w-3/4 rounded-md' />

            <div className='flex items-center justify-between'>
              <SkeletonBlock className='h-3 w-24 rounded-md' />
              <SkeletonBlock className='h-8 w-20 rounded-full' />
            </div>

            <SkeletonBlock className='h-4 w-28 rounded-md' />
          </div>
        ) : (
          <>
            <CardMetaRow className='mb-2'>
              <CardTitle className='text-[1.15rem] leading-tight'>
                {country}
              </CardTitle>
            </CardMetaRow>

            <div className='flex items-center justify-between'>
              <p className='t-meta'>Blog {count}</p>

              <CardPill
                href={regionHref}
                className='shrink-0'
                ariaLabel={`Filtra per regione: ${region}`}
              >
                {region}
              </CardPill>
            </div>

            <Link
              href={href}
              className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] hover:text-[color:var(--paguro-link-hover)]'
            >
              Scopri di più <span aria-hidden>➜</span>
            </Link>
          </>
        )}
      </CardBody>
    </Card>
  );
}
