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

type CoverOrientation = 'portrait' | 'landscape' | 'square' | 'panorama';

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
  coverOrientation,
  coverImage,
  coverLockOrientation,
  coverOrientationEffective,
  coverHotspot,
  coverCrop,
}: {
  lang?: Lang;
  href: string;
  regionHref: string;
  country: string;
  region: string;
  count: number;
  coverSrc: string;
  /**
   * Optional: aspect class for the media wrapper (e.g. 'aspect-video', 'aspect-square').
   * If omitted, we derive it from `coverOrientation`.
   */
  mediaAspect?: string;
  /**
   * Optional: effective cover orientation (e.g. derived from asset dimensions when lockOrientation is ON).
   * Used only when `mediaAspect` is not provided.
   */
  coverOrientation?: CoverOrientation;
  coverImage?: import('@sanity/image-url/lib/types/types').SanityImageSource | null;
  coverLockOrientation?: boolean;
  coverOrientationEffective?: CoverOrientation;
  coverHotspot?: { x?: number; y?: number; height?: number; width?: number } | null;
  coverCrop?: { top?: number; bottom?: number; left?: number; right?: number } | null;
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

  const resolvedMediaAspect = React.useMemo(() => {
    // 1) HARD LOCK — no rhythm allowed
    if (coverLockOrientation && coverOrientationEffective) {
      switch (coverOrientationEffective) {
        case 'panorama':
          return 'aspect-[21/9]';
        case 'square':
          return 'aspect-square';
        case 'portrait':
          return 'aspect-[3/4]';
        case 'landscape':
        default:
          return 'aspect-video';
      }
    }

    // 2) Editorial rhythm (only if not locked)
    if (mediaAspect) return mediaAspect;

    // 3) Soft fallback
    switch (coverOrientation) {
      case 'panorama':
        return 'aspect-[21/9]';
      case 'square':
        return 'aspect-square';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
      default:
        return 'aspect-video';
    }
  }, [coverLockOrientation, coverOrientationEffective, mediaAspect, coverOrientation]);

  return (
    <Card>
      <a
        href={href}
        aria-label={`${labels.open}: ${country}`}
        className='group block cursor-pointer [&_*]:cursor-pointer'
        target='_blank'
        rel='noopener noreferrer'
      >
        <CardMedia className={`${resolvedMediaAspect} relative`}>
          <MediaImage
            src={coverSrc}
            sanityImage={coverImage ?? undefined}
            hotspot={coverHotspot ?? null}
            crop={coverCrop ?? null}
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
