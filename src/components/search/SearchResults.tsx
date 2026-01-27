'use client';

import Link from 'next/link';

export type SanitySearchItem = {
  _id: string;
  _type: 'post' | 'destination';
  title: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
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
  sanityItems: SanitySearchItem[];
  youtubeItems: YouTubeItem[];
  onClose: () => void;
  onNavigate: (href: string) => void;
  getSanityHref: (item: SanitySearchItem) => string;
};

export default function SearchResults({
  totalCount,
  submittedTrimmed,
  sanityItems,
  youtubeItems,
  onClose,
  onNavigate,
  getSanityHref,
}: Props) {
  return (
    <div className='space-y-4 pb-2'>
      <div className='flex items-center justify-between'>
        <p className='t-body text-sm'>
          {totalCount > 0 ? `${totalCount} result(s)` : null}
        </p>

        <Link
          href={`/search?q=${encodeURIComponent(submittedTrimmed)}`}
          onClick={onClose}
          className='t-section-title text-sm font-semibold text-[color:var(--paguro-deep)] hover:text-[color:var(--paguro-coral)]'
        >
          View all →
        </Link>
      </div>

      {sanityItems.length ? (
        <div>
          <p className='t-section-title text-xs font-semibold uppercase tracking-wide'>
            Posts & Destinations
          </p>
          <ul className='mt-2 divide-y rounded-xl border'>
            {sanityItems.map((item) => (
              <li key={item._id}>
                <button
                  type='button'
                  onClick={() => {
                    onNavigate(getSanityHref(item));
                    onClose();
                  }}
                  className='w-full px-3 py-2 text-left transition-colors hover:bg-black/5'
                >
                  <div className='flex items-center justify-between gap-3'>
                    <span className='t-section-title truncate text-sm font-semibold'>
                      {item.title}
                    </span>
                    <span className='t-body rounded-full border px-2 py-0.5 text-[10px]'>
                      {item._type}
                    </span>
                  </div>
                  {item.excerpt ? (
                    <p className='t-body mt-1 line-clamp-2 text-xs'>
                      {item.excerpt}
                    </p>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {youtubeItems.length ? (
        <div>
          <p className='t-section-title text-xs font-semibold uppercase tracking-wide'>
            Videos
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
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={v.thumbnailUrl}
                          alt=''
                          className='h-full w-full object-cover object-center scale-[1.15]'
                          loading='lazy'
                        />
                      </div>
                    ) : null}

                    <div className='min-w-0'>
                      <div className='t-section-title truncate text-sm font-semibold'>
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
        <p className='t-body text-sm'>No matches for “{submittedTrimmed}”.</p>
      ) : null}
    </div>
  );
}
