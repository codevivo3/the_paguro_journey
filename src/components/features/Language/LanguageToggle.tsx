'use client';

import { useEffect, useMemo, useState } from 'react';
import { safeLang, type Lang } from '@/lib/route';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
  /** Current language as resolved by the route segment. */
  lang?: Lang;
};

function computeToggleHref(pathname: string, current: Lang): string {
  const next: Lang = current === 'en' ? 'it' : 'en';

  // Strip the leading /it or /en segment (if present), keep the rest.
  // Examples:
  // - /it            -> ''
  // - /it/blog       -> /blog
  // - /en/dest/x     -> /dest/x
  // - /blog          -> /blog (no prefix; treat as rest)
  const rest = pathname.replace(/^\/(it|en)(?=\/|$)/, '');

  // Home route should be /it or /en (no trailing slash).
  if (!rest || rest === '/') return `/${next}`;

  return `/${next}${rest.startsWith('/') ? rest : `/${rest}`}`;
}

export default function LanguageToggle({ lang }: Props) {
  const pathname = usePathname() || '/';

  const effectiveLang: Lang = safeLang(lang);
  const nextLang: Lang = effectiveLang === 'en' ? 'it' : 'en';

  const toggleHref = useMemo(
    () => computeToggleHref(pathname, effectiveLang),
    [pathname, effectiveLang],
  );

  const labels = {
    it: { aria: 'Passa alla versione in inglese', short: 'EN' },
    en: { aria: 'Switch to Italian version', short: 'IT' },
  } as const;

  const t = labels[effectiveLang];

  const [isDark, setIsDark] = useState(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.dataset.theme === 'dark';
  });

  useEffect(() => {
    const readIsDark = () =>
      document.documentElement.dataset.theme === 'dark';

    // Observe dataset changes when ThemeToggle flips
    const obs = new MutationObserver(() => {
      setIsDark(readIsDark());
    });

    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => obs.disconnect();
  }, []);

  // Fixed-size circle so "EN" and "IT" render identically.
  const className =
    'inline-flex size-9 items-center justify-center rounded-full ' +
    'text-xs font-bold tracking-wide text-white/90 shadow-sm ' +
    'transition-all duration-200 ease-out ' +
    'hover:scale-[1.03] active:scale-[0.97] ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-ocean)]/40';

  return (
    <Link
      href={toggleHref}
      aria-label={t.aria}
      className={className}
      style={{
        backgroundImage: isDark
          ? 'linear-gradient(135deg, rgba(42,58,53,0.95), rgba(23,27,26,0.95))'
          : 'linear-gradient(135deg, rgba(91,194,217,0.55), rgba(65,155,191,0.85))',
      }}
    >
      {/* The label reflects the language you will switch TO */}
      <span aria-hidden='true'>{t.short}</span>
      <span className='sr-only'>{nextLang}</span>
    </Link>
  );
}
