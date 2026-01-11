'use client';

import * as React from 'react';
import Image from 'next/image';

import type { GalleryImage } from '../gallery/GalleryGrid';

type GalleryModalProps = {
  /** Whether the modal is visible */
  isOpen: boolean;

  /** Current selected image (null when closed) */
  current: GalleryImage | null;

  /** Current index (0-based) */
  openIndex: number | null;

  /** Total number of images */
  total: number;

  /** Close modal */
  onClose: () => void;

  /** Navigate */
  onPrev: () => void;
  onNext: () => void;
};

/**
 * GalleryModal
 *
 * Pure UI component.
 * - Renders overlay + panel
 * - Handles “click outside closes”
 * - Shows top bar + arrows
 *
 * NOTE: Keyboard handling and URL logic live in GalleryGrid.
 */
export default function GalleryModal({
  isOpen,
  current,
  openIndex,
  total,
  onClose,
  onPrev,
  onNext,
}: GalleryModalProps) {
  if (!isOpen || !current || openIndex === null) return null;

  return (
    <div
      role='dialog'
      aria-modal='true'
      aria-label='Anteprima immagine'
      className='fixed inset-0 z-50'
    >
      {/* Overlay */}
      <div
        className='absolute inset-0 bg-black/70'
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      {/* Panel wrapper (clicking empty space closes too) */}
      <div
        className='absolute inset-0 flex items-center justify-center p-4'
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className='relative w-full max-w-5xl overflow-hidden rounded-sm border border-white/10 bg-black shadow-2xl'>
          {/* Top bar */}
          <div className='relative grid grid-cols-3 items-center gap-3 border-b border-white/10 bg-black/70 px-4 py-3'>
            <div className='text-sm text-white/80 [font-family:var(--font-ui)]'>
              {openIndex + 1} / {total}
            </div>

            {/* Open original (kept as-is: new tab) */}
            <div className='flex items-center justify-center'>
              <a
                href={current.src}
                target='_blank'
                rel='noreferrer'
                className='rounded-full text-white/90 transition-transform duration-300 hover:scale-[1.25]'
                aria-label='Apri immagine originale'
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
                    d='M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15'
                  />
                </svg>
              </a>
            </div>

            <div className='flex items-center justify-end'>
              <button
                type='button'
                onClick={onClose}
                aria-label='Chiudi'
                className='inline-flex items-center justify-center rounded-full text-white/90 transition-transform duration-300 hover:scale-[1.25]'
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
          </div>

          {/* Image */}
          <div className='relative block w-full'>
            <div className='relative h-[70vh] w-full'>
              <Image
                src={current.src}
                alt={current.alt ?? 'Foto viaggio'}
                fill
                sizes='100vw'
                className='object-contain'
                priority
              />
            </div>
          </div>

          {/* Nav buttons */}
          <button
            type='button'
            onClick={onPrev}
            aria-label='Immagine precedente'
            className='absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full px-2 py-2 backdrop-blur bg-white/3 text-white transition hover:bg-white/20'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='size-8'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M15.75 19.5 8.25 12l7.5-7.5'
              />
            </svg>
          </button>

          <button
            type='button'
            onClick={onNext}
            aria-label='Immagine successiva'
            className='absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/5 px-2 py-2 text-white backdrop-blur transition hover:bg-white/20'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth='2'
              stroke='currentColor'
              className='size-8'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='m8.25 4.5 7.5 7.5-7.5 7.5'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
