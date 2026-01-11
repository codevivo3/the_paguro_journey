'use client';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import Image from 'next/image';

import { useUI } from '@/context/ui-context';

export default function SearchModal() {
  const { isSearchOpen, openSearch, closeSearch } = useUI();
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
    if (!isSearchOpen) return;

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
    // (autoFocus usually works, this makes it deterministic.)
    searchInputRef.current?.focus();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [isSearchOpen]);

  return (
    <>
      <button
        ref={searchButtonRef}
        type='button'
        onClick={openSearch}
        aria-label='Search'
        className='inline-flex items-center h-9.5 w-9.5 px-2 py-1 rounded-3xl transition-colors duration-500 hover:bg-white/20 hover:shadow-sm hover:text-[color:var(--paguro-text-light)] hover:border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='1.5'
          stroke='currentColor'
          className='size-5.5'
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
              className='fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md px-4'
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className='w-full max-w-md rounded bg-white p-6 shadow-xl'
              >
                <div className='flex items-center justify-between'>
                  <h2 className='text-black [font-family:var(--font-ui)] font-semibold'>
                    Search
                  </h2>
                  <button
                    type='button'
                    aria-label='Close search modal'
                    onClick={closeAndRestoreFocus}
                    className='text-black text-xl [font-family:var(--font-ui)] transition-transform duration-300 hover:scale-[1.25]'
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

                <input
                  ref={searchInputRef}
                  type='text'
                  placeholder='Search...'
                  className='[font-family:var(--font-ui)] mt-4 w-full rounded border border-gray-300 px-3 py-2 text-black focus:outline-none focus:ring focus:ring-blue-500'
                  autoFocus
                />
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}
