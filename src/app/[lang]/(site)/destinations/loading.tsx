'use client';

import * as React from 'react';
import { useParams, usePathname } from 'next/navigation';

import { safeLang, type Lang } from '@/lib/route';
import { pickLang } from '@/lib/pickLang';

export default function DestinationsLoading() {
  const params = useParams() as { lang?: string } | null;
  const pathname = usePathname();

  const inferred = (() => {
    const p = params?.lang;
    if (p === 'it' || p === 'en') return p;
    if (pathname?.startsWith('/en')) return 'en';
    if (pathname?.startsWith('/it')) return 'it';
    return 'it';
  })();

  const lang: Lang = safeLang(inferred as Lang);

  const title = pickLang(lang, 'Destinazioni', 'Destinations') ?? 'Destinazioni';
  const subtitle =
    pickLang(lang,
      'Una mappa semplice dei luoghi che abbiamo esplorato — per ora guidata dai video, con storie e guide in arrivo.',
      'A simple map of the places we explored — currently video-led, with stories and guides coming soon.',
    ) ??
    'Una mappa semplice dei luoghi che abbiamo esplorato — per ora guidata dai video, con storie e guide in arrivo.';

  return (
    <main className='min-h-screen bg-[color:var(--paguro-bg)] px-6 pt-24 pb-24 text-[color:var(--paguro-text)]'>
      <div className='mx-auto max-w-6xl space-y-10'>
        {/* Header (real text, so you instantly know where you are) */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>{title}</h1>
          <p className='t-page-subtitle'>{subtitle}</p>
        </header>

        {/* Filter trigger skeleton (matches the real trigger shape) */}
        <div
          className={[
            'mx-auto flex w-fit',
            'min-w-[180px] max-w-[220px]',
            'h-9 rounded-full px-4',
            'items-center justify-between gap-3',
            'bg-gradient-to-b from-[var(--pill-from)] to-[var(--pill-to)]',
            'shadow-[0_6px_18px_rgba(0,0,0,0.12)]',
          ].join(' ')}
        >
          <div className='h-3 w-16 rounded-sm skeleton' />
          <div className='h-4 w-4 rounded-full skeleton' />
        </div>

        {/* Cards skeleton */}
        <section className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 9 }).map((_, i) => (
            <article
              key={i}
              className='isolate overflow-hidden rounded-md border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm'
            >
              {/* Media */}
              <div className='aspect-video skeleton' />

              {/* Body */}
              <div className='flex flex-col gap-3 p-6'>
                {/* Title */}
                <div className='h-5 w-3/4 rounded-md skeleton' />

                {/* Meta */}
                <div className='h-3 w-24 rounded-md skeleton' />

                {/* Pill */}
                <div className='h-8 w-20 rounded-full skeleton' />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
