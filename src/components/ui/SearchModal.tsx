'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { useUI } from '@/context/ui-context';
import SearchResults from '@/components/search/SearchResults';
import SearchInput from '@/components/search/SearchInput';

type SanitySearchItem = {
  _id: string;
  _type: 'post' | 'destination';
  title: string;
  slug?: string;
  excerpt?: string;
  coverImageUrl?: string | null;
};

type YouTubeItem = {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  channelTitle?: string;
};

type ApiResponse = {
  q: string;
  sanity: { items: SanitySearchItem[]; total: number };
  youtube: { items: YouTubeItem[]; total: number };
};

function getSanityHref(item: SanitySearchItem): string {
  if (item._type === 'post') {
    return item.slug ? `/blog/${item.slug}` : '/blog';
  }

  // NOTE: adjust this if your destinations route differs.
  return item.slug ? `/destinations/${item.slug}` : '/destinations';
}

function useSearchResults(opts: { isOpen: boolean; submittedQuery: string }) {
  const { isOpen, submittedQuery } = opts;

  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAbortError = (err: unknown) => {
    if (!err || typeof err !== 'object') return false;
    const anyErr = err as { name?: unknown; code?: unknown; message?: unknown };
    const name = typeof anyErr.name === 'string' ? anyErr.name : '';
    const code = typeof anyErr.code === 'string' ? anyErr.code : '';
    const msg = typeof anyErr.message === 'string' ? anyErr.message : '';
    return (
      name === 'AbortError' ||
      code === 'UND_ERR_ABORTED' ||
      msg.toLowerCase().includes('signal is aborted')
    );
  };

  useEffect(() => {
    if (!isOpen) return;

    const q = submittedQuery.trim();

    // Guardrails: min 3 chars.
    if (!q || q.length < 3) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Search failed (${res.status})`);
        }

        const json = (await res.json()) as ApiResponse;
        setData(json);
      } catch (err) {
        // Abort is expected when:
        // - user closes modal
        // - user submits a new query quickly
        // Next can surface this as a runtime error in dev unless we swallow it.
        if (controller.signal.aborted || isAbortError(err)) return;

        setError(err instanceof Error ? err.message : 'Search failed');
        setData(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => {
      try {
        // Guard + reason: avoids noisy "signal is aborted without reason" overlays in some runtimes.
        if (!controller.signal.aborted) {
          controller.abort('cleanup');
        }
      } catch {
        // Extremely defensive: abort() should not throw, but we never want this to surface.
      }
    };
  }, [submittedQuery, isOpen]);

  const reset = () => {
    setData(null);
    setLoading(false);
    setError(null);
  };

  return { data, loading, error, reset };
}

function LoadingRow() {
  return (
    <div
      className='flex items-center gap-2 text-sm text-black/70'
      aria-live='polite'
    >
      <svg
        className='h-10 w-10 animate-spin'
        viewBox='0 0 50 50'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'
      >
        <defs>
          <linearGradient
            id='paguroSpinnerGradient'
            x1='0%'
            y1='0%'
            x2='100%'
            y2='100%'
          >
            <stop offset='0%' stopColor='var(--paguro-ocean)' />
            <stop offset='25%' stopColor='var(--paguro-deep)' />
            <stop offset='50%' stopColor='var(--paguro-sand)' />
            <stop offset='75%' stopColor='var(--paguro-sunset)' />
            <stop offset='100%' stopColor='var(--paguro-coral)' />
          </linearGradient>
        </defs>

        <circle
          cx='25'
          cy='25'
          r='20'
          fill='none'
          stroke='url(#paguroSpinnerGradient)'
          strokeWidth='4'
          strokeLinecap='round'
          strokeDasharray='90 40'
        />
      </svg>
      <span className='t-body'>Sto cercando…</span>
    </div>
  );
}

export default function SearchModal() {
  const { isSearchOpen, openSearch, closeSearch } = useUI();

  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const qFromUrl = sp.get('q') ?? '';
  const [value, setValue] = useState(qFromUrl);
  const [debouncedValue, setDebouncedValue] = useState(qFromUrl);
  const [submittedQuery, setSubmittedQuery] = useState('');

  const {
    data,
    loading,
    error,
    reset: resetResults,
  } = useSearchResults({ isOpen: isSearchOpen, submittedQuery });

  // Keep the input synced when URL changes (back/forward, other navigation).
  // This does NOT trigger navigation while typing.
  useEffect(() => {
    setValue(qFromUrl);
    setDebouncedValue(qFromUrl);
  }, [qFromUrl]);

  // Safety: if a navigation happens while the modal is open, close it so
  // scroll-lock and focus are reliably restored.
  useEffect(() => {
    if (!isSearchOpen) return;
    closeSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const currentSearch = useMemo(() => sp.toString(), [sp]);

  const searchButtonRef = useRef<HTMLButtonElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const canUseDOM = typeof document !== 'undefined';

  const closeAndRestoreFocus = () => {
    closeSearch();
    // Restore focus after React commits the state update.
    requestAnimationFrame(() => {
      searchButtonRef.current?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    // Always ensure background scrolling is restored when the modal is closed.
    if (!isSearchOpen) {
      if (typeof document !== 'undefined') {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAndRestoreFocus();
    };

    // Lock background scroll while the modal is open.
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    window.addEventListener('keydown', handleKeyDown);

    // Focus the input as soon as the modal is mounted.
    searchInputRef.current?.focus();
    setSubmittedQuery('');
    resetResults();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isSearchOpen]);

  // Debounce typing so we don't fire a request on every keystroke.
  // This auto-triggers search (no Enter needed) once the user pauses typing.
  useEffect(() => {
    if (!isSearchOpen) return;

    const id = window.setTimeout(() => {
      setDebouncedValue(value);

      const q = value.trim();
      if (q.length >= 3) {
        setSubmittedQuery(q);
      } else {
        // If query becomes too short, clear results.
        setSubmittedQuery('');
      }
    }, 500);

    return () => window.clearTimeout(id);
  }, [value, isSearchOpen]);

  const trimmedValue = value.trim();
  const submittedTrimmed = submittedQuery.trim();
  const showResults = submittedTrimmed.length >= 3;

  const sanityItems = data?.sanity.items ?? [];
  const youtubeItems = data?.youtube.items ?? [];

  const totalCount = (data?.sanity.total ?? 0) + (data?.youtube.total ?? 0);

  return (
    <>
      <button
        ref={searchButtonRef}
        type='button'
        onClick={openSearch}
        aria-label='Search'
        className='group relative inline-flex h-8 w-8 items-center justify-center rounded-full text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none'
      >
        <svg
          aria-hidden
          className='pointer-events-none absolute inset-0 -rotate-90'
          viewBox='0 0 36 36'
        >
          <circle
            cx='18'
            cy='18'
            r='16'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='butt'
            className='[stroke-dasharray:101] [stroke-dashoffset:100] opacity-0 transition-[stroke-dashoffset,opacity] duration-300 ease-out group-hover:[stroke-dashoffset:0] group-hover:opacity-100'
          />
        </svg>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='1.3'
          stroke='currentColor'
          className='relative z-10 size-5.5'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
          />
        </svg>
      </button>

      {canUseDOM && isSearchOpen
        ? createPortal(
            <div
              role='dialog'
              aria-modal='true'
              aria-label='Search'
              onClick={closeAndRestoreFocus}
              className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md'
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className='w-full max-w-md rounded-md bg-[color:var(--paguro-surface)] p-6 shadow-xl max-h-[85vh] flex flex-col'
              >
                <div className='flex items-center justify-between'>
                  <h2 className='t-section-title font-semibold'>Cerca</h2>
                  <button
                    type='button'
                    aria-label='Close search modal'
                    onClick={closeAndRestoreFocus}
                    className='text-[color:var(--paguro-text)] text-xl [font-family:var(--font-ui)] transition-transform duration-300 hover:scale-[1.25]'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth='1.5'
                      stroke='currentColor'
                      className='size-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                      />
                    </svg>
                  </button>
                </div>
                <SearchInput
                  value={value}
                  onChange={setValue}
                  inputRef={searchInputRef}
                  onSubmit={() => {
                    const q = value.trim();
                    if (q.length < 3) return;
                    // Immediate search on submit (skips debounce wait).
                    setDebouncedValue(q);
                    setSubmittedQuery(q);
                  }}
                />

                {/* Helper + results */}
                <div
                  className='mt-4 flex-1 overflow-y-auto pr-3 [-webkit-overflow-scrolling:touch] '
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'var(--paguro-sand) var(--paguro-surface)',
                  }}
                >
                  {/* Scrollbar styling relies on Tailwind scrollbar plugin or modern WebKit support. */}
                  {!trimmedValue ? (
                    <p className='text-sm t-body'>
                      Digita almeno 3 caratteri per cercare.
                    </p>
                  ) : trimmedValue.length < 3 ? (
                    <p className='text-sm t-body'>
                      Ancora {3 - trimmedValue.length} carattere/i…
                    </p>
                  ) : !submittedTrimmed ? (
                    <p className='text-sm t-body'>Sto preparando la ricerca…</p>
                  ) : loading ? (
                    <LoadingRow />
                  ) : error ? (
                    <p className='text-sm text-red-600'>{error}</p>
                  ) : showResults ? (
                    <SearchResults
                      totalCount={totalCount}
                      submittedTrimmed={submittedTrimmed}
                      sanityItems={sanityItems}
                      youtubeItems={youtubeItems}
                      onClose={closeAndRestoreFocus}
                      onNavigate={(href) => router.push(href)}
                      getSanityHref={getSanityHref}
                    />
                  ) : null}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
