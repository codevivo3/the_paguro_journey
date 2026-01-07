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
        className='inline-flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-300 hover:bg-white/20 hover:border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 p-0.5'
      >
        <Image src='/search-white.svg' alt='Search' width={22} height={22} />
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
                    className='text-black text-xl [font-family:var(--font-ui)]'
                  >
                    <Image
                      src='/cancel-black.svg'
                      alt='Close'
                      width={24}
                      height={24}
                    />
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
