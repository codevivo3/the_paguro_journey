'use client';

import * as React from 'react';
import { safeLang, type Lang } from '@/lib/route';

type Theme = 'light' | 'dark';

/**
 * Reads the preferred theme.
 * Priority:
 * 1) persisted user choice (localStorage)
 * 2) OS preference (prefers-color-scheme)
 */
function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem('theme');
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Applies theme to the document.
 * NOTE: We only set `data-theme`.
 * We intentionally do NOT force `color-scheme` so native UI (scrollbars, inputs)
 * can follow the OS/browser.
 */
function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

// --- Icons (inline SVG; no external deps) ----------------------------------

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.5'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <circle cx='12' cy='12' r='4' />
      <path d='M12 2v2' />
      <path d='M12 20v2' />
      <path d='m4.93 4.93 1.41 1.41' />
      <path d='m17.66 17.66 1.41 1.41' />
      <path d='M2 12h2' />
      <path d='M20 12h2' />
      <path d='m6.34 17.66-1.41 1.41' />
      <path d='m19.07 4.93-1.41 1.41' />
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      width='24'
      height='24'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      {...props}
    >
      <path d='M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z' />
    </svg>
  );
}

export default function SwitchTheme({ lang }: { lang?: Lang }) {
  const effectiveLang: Lang = safeLang(lang);

  const [theme, setTheme] = React.useState<Theme>(() => {
    // Initialize from storage/OS preference on the client to avoid an extra setState in an effect.
    return typeof window === 'undefined' ? 'light' : getPreferredTheme();
  });

  const labels = {
    it: { aria: 'Cambia tema', sr: 'Cambia tema' },
    en: { aria: 'Toggle theme', sr: 'Toggle theme' },
  } as const;

  const t = labels[effectiveLang];

  React.useEffect(() => {
    // Sync React theme state -> DOM + persistence.
    applyTheme(theme);
    try {
      window.localStorage.setItem('theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggle = React.useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isDark = theme === 'dark';

  const trackClassName =
    'relative inline-flex h-9 w-16 items-center rounded-full p-1 ' +
    'transition-colors duration-300 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-ocean)]/40 ' +
    'shadow-sm';

  const knobClassName =
    'relative z-10 grid size-7 place-items-center rounded-full ' +
    'bg-white/90 backdrop-blur shadow-md transition-transform duration-300 ' +
    'ease-[cubic-bezier(.2,.9,.2,1.2)] ' +
    (isDark ? 'translate-x-7' : 'translate-x-0');

  return (
    <button
      type='button'
      onClick={toggle}
      role='switch'
      aria-checked={isDark}
      aria-label={t.aria}
      className={trackClassName}
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, rgba(42,58,53,0.95), rgba(23,27,26,0.95))'
          : 'linear-gradient(135deg, rgba(91,194,217,0.55), rgba(65,155,191,0.85))',
      }}
    >
      <span className='sr-only'>{t.sr}</span>

      {/* Decorative track icons (subtle) */}
      <span aria-hidden='true' className='absolute left-2 text-white/80'>
        <SunIcon className='size-4' />
      </span>

      <span aria-hidden='true' className='absolute right-2 text-white/80'>
        <MoonIcon className='size-4' />
      </span>

      {/* Sliding knob */}
      <span aria-hidden='true' className={knobClassName}>
        {isDark ? (
          <MoonIcon className='size-4 text-[color:var(--paguro-deep)]' />
        ) : (
          <SunIcon className='size-4 text-[color:var(--paguro-deep)]' />
        )}
      </span>
    </button>
  );
}