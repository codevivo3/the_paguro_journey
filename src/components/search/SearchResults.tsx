'use client';

import Image from 'next/image';
import Link from 'next/link';
import { urlFor } from '@/sanity/lib/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';
import { pickLang } from '@/lib/pickLang';

function isSanityImageWithAssetRef(
  source: SanityImageSource | null | undefined,
): source is { asset: { _ref: string } } {
  if (!source || typeof source !== 'object') return false;
  // Sanity image objects typically look like: { _type: 'image', asset: { _ref: 'image-...'} }
  const anySource = source as unknown as { asset?: { _ref?: unknown } };
  const ref = anySource.asset?._ref;
  return typeof ref === 'string' && ref.startsWith('image-');
}

export type SanitySearchItem = {
  _id: string;
  _type: 'post' | 'destination';

  // Resolved (fallback already applied upstream, but we still guard)
  title: string;
  excerpt?: string;

  // Raw bilingual fields (optional)
  titleIt?: string | null;
  titleEn?: string | null;
  excerptIt?: string | null;
  excerptEn?: string | null;

  slug?: string;
  coverImageUrl?: string | null;
  coverImage?: SanityImageSource | null;
};

export type YouTubeItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  channelTitle?: string;
};

type Props = {
  totalCount: number;
  submittedTrimmed: string;
  lang: Lang;
  sanityItems: SanitySearchItem[];
  youtubeItems: YouTubeItem[];
  onClose: () => void;
  onNavigate: (href: string) => void;
  getSanityHref: (item: SanitySearchItem) => string;
};


export default function SearchResults({
  totalCount,
  submittedTrimmed,
  lang,
  sanityItems,
  youtubeItems,
  onClose,
  onNavigate,
  getSanityHref,
}: Props) {
  const effectiveLang: Lang = safeLang(lang);

  const t = {
    results: {
      it: (n: number) => `${n} ${n === 1 ? 'risultato' : 'risultati'}`,
      en: (n: number) => `${n} ${n === 1 ? 'result' : 'results'}`,
    },
    viewAll: { it: 'Vedi tutto →', en: 'View all →' },
    sectionSanity: { it: 'Articoli & Destinazioni', en: 'Posts & Destinations' },
    sectionVideos: { it: 'Video', en: 'Videos' },
    typeBlog: { it: 'blog', en: 'blog' },
    typeDestination: { it: 'destinazione', en: 'destination' },
    noMatches: {
      it: (q: string) => `Nessun risultato per “${q}”.`,
      en: (q: string) => `No matches for “${q}”.`,
    },
  } as const;

  return (
    <div className='space-y-4 pb-2'>
      <div className='flex items-center justify-between'>
        <p className='t-body text-sm'>
          {totalCount > 0 ? t.results[effectiveLang](totalCount) : null}
        </p>

        <Link
          href={withLangPrefix(
            effectiveLang,
            `/search?q=${encodeURIComponent(submittedTrimmed)}`,
          )}
          onClick={onClose}
          className='t-section-title text-sm font-semibold text-[color:var(--paguro-deep)] hover:text-[color:var(--paguro-coral)]'
        >
          {t.viewAll[effectiveLang]}
        </Link>
      </div>

      {sanityItems.length ? (
        <div>
          <p className='t-section-title text-xs font-semibold uppercase tracking-wide'>
            {t.sectionSanity[effectiveLang]}
          </p>
          <ul className='mt-2 divide-y rounded-xl border'>
            {sanityItems.map((item) => {
              const resolvedTitle =
                pickLang(effectiveLang, item.titleIt ?? undefined, item.titleEn ?? undefined) ??
                (item.title?.trim() || '');

              const resolvedExcerpt =
                pickLang(effectiveLang, item.excerptIt ?? undefined, item.excerptEn ?? undefined) ??
                (item.excerpt?.trim() || undefined);

              const typeLabel =
                item._type === 'post'
                  ? t.typeBlog[effectiveLang]
                  : t.typeDestination[effectiveLang];

              return (
                <li key={item._id}>
                  <button
                    type='button'
                    onClick={() => {
                      onNavigate(getSanityHref(item));
                      onClose();
                    }}
                    className='w-full px-3 py-2 text-left transition-colors hover:bg-black/5'
                  >
                    <div className='flex items-start gap-3'>
                      <div className='h-10 w-16 shrink-0 overflow-hidden rounded bg-black/10'>
                        {(() => {
                          const src = isSanityImageWithAssetRef(item.coverImage)
                            ? urlFor(item.coverImage)
                                .width(128)
                                .height(80)
                                .fit('crop')
                                .auto('format')
                                .url()
                            : item.coverImageUrl ?? null;

                          return src ? (
                            <Image
                              src={src}
                              alt={resolvedTitle}
                              width={64}
                              height={40}
                              className='h-full w-full object-cover'
                            />
                          ) : null;
                        })()}
                      </div>

                      <div className='min-w-0 flex-1'>
                        <div className='flex items-center justify-between gap-3'>
                          <span className='t-section-title truncate text-sm font-semibold [font-family:var(--font-ui)]'>
                            {resolvedTitle}
                          </span>
                          <span className='t-body rounded-full border px-2 py-0.5 text-[10px]'>
                            {typeLabel}
                          </span>
                        </div>

                        {resolvedExcerpt ? (
                          <p className='t-body mt-1 line-clamp-2 text-xs'>{resolvedExcerpt}</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {youtubeItems.length ? (
        <div>
          <p className='t-section-title text-xs font-semibold uppercase tracking-wide'>
            {t.sectionVideos[effectiveLang]}
          </p>
          <ul className='mt-2 divide-y rounded-xl border'>
            {youtubeItems.map((v) => (
              <li key={v.id}>
                <a
                  href={v.url}
                  target='_blank'
                  rel='noreferrer noopener'
                  onClick={onClose}
                  className='block px-3 py-2 transition-colors hover:bg-black/5'
                >
                  <div className='flex items-center gap-3'>
                    {v.thumbnailUrl ? (
                      <div className='h-10 w-16 flex-none overflow-hidden rounded bg-black/10'>
                        <Image
                          src={v.thumbnailUrl}
                          alt={v.title}
                          width={64}
                          height={40}
                          className='h-full w-full object-cover scale-[1.1]'
                        />
                      </div>
                    ) : null}

                    <div className='min-w-0'>
                      <div className='t-section-title truncate text-sm font-semibold [font-family:var(--font-ui)]'>
                        {v.title}
                      </div>
                      <div className='t-body mt-1 line-clamp-2 text-xs'>
                        {v.channelTitle ?? 'YouTube'}
                      </div>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!sanityItems.length && !youtubeItems.length ? (
        <p className='t-body text-sm'>{t.noMatches[effectiveLang](submittedTrimmed)}</p>
      ) : null}
    </div>
  );
}
