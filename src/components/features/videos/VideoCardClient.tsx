'use client';

import * as React from 'react';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

import type { YouTubeVideo } from '@/lib/youtube/youtube';
import { cleanYouTubeDescription } from '@/lib/cleanYouTubeDescription';
import MediaImage from '@/components/features/media/MediaImage';
import { Lang, safeLang } from '@/lib/route';

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden />;
}

export type VideoCardClientProps = {
  lang?: Lang;
  video: YouTubeVideo;
  /** Optional label for the thumbnail link (accessibility) */
  ariaLabel?: string;
};

export default function VideoCardClient({
  lang,
  video,
  ariaLabel,
}: VideoCardClientProps) {
  const effectiveLang = safeLang(lang);
  const [ready, setReady] = React.useState(false);

  const labels = {
    it: {
      watch: 'Guarda il video',
      watchAria: 'Guarda il video',
    },
    en: {
      watch: 'Watch video',
      watchAria: 'Watch video',
    },
  } as const;

  const t = labels[effectiveLang];

  return (
    <Card>
      <CardMedia className='aspect-video overflow-hidden bg-transparent'>
        <a
          href={video.href}
          target='_blank'
          rel='noopener noreferrer'
          aria-label={ariaLabel ?? `${t.watchAria}: ${video.title}`}
          className='block relative h-full w-full'
        >
          <MediaImage
            src={video.thumbnail}
            alt={video.title}
            fill
            sizes='(max-width: 768px) 85vw, (max-width: 1024px) 70vw, 33vw'
            className='object-cover scale-[1.01] transition-transform duration-300 hover:scale-[1.03]'
            quality={90}
            onLoaded={() => setReady(true)}
          />
        </a>
      </CardMedia>

      <CardBody className='flex h-full flex-col'>
        {!ready ? (
          <div className='space-y-3'>
            <SkeletonBlock className='h-5 w-11/12' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-10/12' />
            <SkeletonBlock className='h-4 w-9/12' />
            <div className='pt-2'>
              <SkeletonBlock className='h-4 w-32' />
            </div>
          </div>
        ) : (
          <>
            <CardTitle>{video.title}</CardTitle>
            <CardText className='clamp-4'>
              {cleanYouTubeDescription(video.description)}
            </CardText>
            <a
              href={video.href}
              target='_blank'
              rel='noopener noreferrer'
              className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 hover:text-[color:var(--paguro-link-hover)]'
            >
              {t.watch} <span aria-hidden>➜</span>
            </a>
          </>
        )}
      </CardBody>
    </Card>
  );
}
