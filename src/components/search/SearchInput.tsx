'use client';

import type { RefObject } from 'react';
import { safeLang, type Lang } from '@/lib/route';

type SearchInputProps = {
  lang?: Lang;
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  inputRef: RefObject<HTMLInputElement | null>;
};

export default function SearchInput({
  lang,
  value,
  onChange,
  onSubmit,
  inputRef,
}: SearchInputProps) {
  const effectiveLang: Lang = safeLang(lang);

  const labels = {
    it: {
      placeholder: 'Cerca…',
      ariaSearch: 'Cerca',
    },
    en: {
      placeholder: 'Search…',
      ariaSearch: 'Search',
    },
  } as const;

  const t = labels[effectiveLang];

  return (
    <div className='mt-4 relative rounded-full p-[2px] bg-gradient-to-r from-[color:var(--paguro-ocean)] via-[color:var(--paguro-deep)] via-[color:var(--paguro-sand)] via-[color:var(--paguro-sunset)] to-[color:var(--paguro-coral)]'>
      <input
        ref={inputRef}
        type='text'
        placeholder={t.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          // Avoid accidental form submits / default Enter behavior.
          if (e.key === 'Enter' || e.key === 'NumpadEnter') {
            e.preventDefault();
            onSubmit();
          }
        }}
        className='w-full rounded-full bg-[color:var(--paguro-surface)] px-3 py-2 pr-10 t-page-subtitle text-sm text-justify focus:outline-none'
        autoFocus
      />

      <button
        type='button'
        aria-label={t.ariaSearch}
        onClick={onSubmit}
        className='absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--paguro-text-muted)] transition-colors hover:text-[color:var(--paguro-text)] focus:outline-none'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth='2'
          stroke='currentColor'
          className='size-5'
          aria-hidden='true'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z'
          />
        </svg>
      </button>
    </div>
  );
}
