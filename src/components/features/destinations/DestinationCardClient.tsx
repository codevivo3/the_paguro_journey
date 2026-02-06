'use client';

import * as React from 'react';
import { useParams, usePathname } from 'next/navigation';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardMetaRow,
  CardPill,
} from '@/components/ui/Card';
import MediaImage from '@/components/features/media/MediaImage';
import { safeLang, type Lang } from '@/lib/route';

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-[inherit] ${className}`} />;
}

export function DestinationCardClient({
  lang,
  href,
  regionHref,
  country,
  region,
  count,
  coverSrc,
  mediaAspect,
}: {
  lang?: Lang;
  href: string;
  regionHref: string;
  country: string;
  region: string;
  count: number;
  coverSrc: string;
  mediaAspect: string;
}) {
  const params = useParams() as { lang?: string } | null;
  const pathname = usePathname();

  const inferred = (() => {
    const p = params?.lang;
    if (p === 'it' || p === 'en') return p;
    if (pathname?.startsWith('/en')) return 'en';
    if (pathname?.startsWith('/it')) return 'it';
    return 'it';
  })();

  const effectiveLang: Lang = safeLang(lang ?? (inferred as Lang));

  // Ensure internal routes are lang-prefixed (e.g. /it/regions/..., /en/regions/...).
  const ensureLangPath = React.useCallback(
    (path: string) => {
      if (!path) return path;
      // If already prefixed with /it/... or /en/... keep it.
      if (path.startsWith(`/${effectiveLang}/`)) return path;
      // If it's an absolute path like /regions/..., prefix it.
      if (path.startsWith('/')) return `/${effectiveLang}${path}`;
      // Otherwise treat it as a relative segment and prefix it.
      return `/${effectiveLang}/${path}`;
    },
    [effectiveLang]
  );

  const effectiveRegionHref = ensureLangPath(regionHref);

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

  const t = {
    it: {
      open: 'Apri destinazione',
      filter: 'Filtra per regione',
      videoSingular: 'Video',
      videoPlural: 'Video',
      discover: 'Scopri di più',
    },
    en: {
      open: 'Open destination',
      filter: 'Filter by region',
      videoSingular: 'Video',
      videoPlural: 'Videos',
      discover: 'Discover more',
    },
  } as const;

  const labels = t[effectiveLang];

  return (
    <Card>
      <a
        href={href}
        aria-label={`${labels.open}: ${country}`}
        className='group block cursor-pointer [&_*]:cursor-pointer'
        target='_blank'
        rel='noopener noreferrer'
      >
        <CardMedia className={`${mediaAspect} relative`}>
          <MediaImage
            src={coverSrc}
            alt={country}
            fill
            sizes='(max-width: 1024px) 100vw, 33vw'
            className='object-cover transition-transform duration-300 group-hover:scale-[1.02]'
            onLoaded={handleLoaded}
          />
        </CardMedia>
      </a>

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
              <p className='t-meta'>
                {(count === 1 ? labels.videoSingular : labels.videoPlural)}: {count}
              </p>

              <CardPill
                href={effectiveRegionHref}
                className='shrink-0'
                ariaLabel={`${labels.filter}: ${region}`}
              >
                {region}
              </CardPill>
            </div>

            <a
              href={href}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-auto inline-flex cursor-pointer [&_*]:cursor-pointer pointer-events-auto items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] hover:text-[color:var(--paguro-link-hover)]'
            >
              {labels.discover} <span aria-hidden>➜</span>
            </a>
          </>
        )}
      </CardBody>
    </Card>
  );
}
