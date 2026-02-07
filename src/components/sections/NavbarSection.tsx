'use client';
import { Suspense, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import SearchModal from '../ui/SearchModal';
import SwitchTheme from '../features/theme/ThemeToggle';
import LanguageToggle from '@/components/features/Language/LanguageToggle';
import { withLangPrefix, stripLangPrefix, safeLang, type Lang } from '@/lib/route';

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
  liClassName: string;
  linkClassName: string;
  underlineBase: string;
  underlineInactive: string;
  underlineActive: string;
};

function NavItem({
  href,
  label,
  active,
  liClassName,
  linkClassName,
  underlineBase,
  underlineInactive,
  underlineActive,
}: NavItemProps) {
  return (
    <li className={liClassName}>
      <Link href={linkClassName ? href : href} className={linkClassName}>
        {label}
      </Link>

      {/* underline bar */}
      <span
        aria-hidden='true'
        className={`${underlineBase} ${active ? underlineActive : underlineInactive}`}
      />
    </li>
  );
}

type NavbarProps = {
  lang?: Lang;
};

export default function Navbar({ lang }: NavbarProps) {
  const pathname = usePathname();
  const effectiveLang: Lang = safeLang(
    lang ?? (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'it')
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const readTheme = (): 'light' | 'dark' => {
    if (typeof document === 'undefined') return 'light';

    const dt = document.documentElement.dataset.theme;
    if (dt === 'dark' || dt === 'light') return dt;

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }

    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => readTheme());

  useEffect(() => {
    // Observe dataset changes when the ThemeToggle flips
    const obs = new MutationObserver(() => {
      setTheme(readTheme());
    });

    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => obs.disconnect();
  }, []);

  const langToggleBg =
    theme === 'dark'
      ? 'linear-gradient(135deg, rgba(42,58,53,0.95), rgba(23,27,26,0.95))'
      : 'linear-gradient(135deg, rgba(91,194,217,0.55), rgba(65,155,191,0.85))';

  const isActive = (href: string) => {
    const current = stripLangPrefix(pathname || '/');
    const target = stripLangPrefix(href);
    return current === target || current.startsWith(`${target}/`);
  };

  const isHome = stripLangPrefix(pathname || '/') === '/';

  function scrollToTopSmooth() {
    if (typeof window === 'undefined') return;
    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  }

  const handleLogoClick = (e: React.MouseEvent) => {
    // Always close mobile menu
    setMobileOpen(false);

    // If we're already on home, don't re-navigate — just scroll to hero/top.
    if (isHome) {
      e.preventDefault();
      scrollToTopSmooth();
    }
  };

  // LI is the positioning + hover group container
  const LI_CLASS =
    'relative px-1 py-1 text-sm font-semibold text-white group cursor-pointer';

  // Link stays in normal flow (no absolute, no w-0)
  const LINK_CLASS = 'relative z-10 inline-flex items-center justify-center';

  // Underline is the absolute element
  const UNDERLINE_BASE =
    'absolute left-0 bottom-0 h-[2px] bg-white rounded-full transition-all duration-300';

  // States for underline
  const UNDERLINE_INACTIVE = 'w-0 group-hover:w-full';
  const UNDERLINE_ACTIVE = 'w-full';

  const labels = {
    it: {
      blog: 'Blog',
      destinations: 'Destinazioni',
      gallery: 'Galleria',
      about: 'Chi Siamo',
      contact: 'Contatti',
      homeAria: 'Vai alla homepage',
    },
    en: {
      blog: 'Blog',
      destinations: 'Destinations',
      gallery: 'Gallery',
      about: 'About',
      contact: 'Contact',
      homeAria: 'Go to homepage',
    },
  } as const;

  const t = labels[effectiveLang];

  const navItems = [
    { href: '/blog', label: t.blog },
    { href: '/destinations', label: t.destinations },
    { href: '/gallery', label: t.gallery },
    { href: '/about', label: t.about },
    { href: '/contact', label: t.contact },
  ];

  return (
    <nav className='fixed top-0 right-0 left-0 z-[9999] isolate [font-family:var(--font-ui)] bg-[color:var(--paguro-deep)]/80 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between h-12 px-6 lg:px-12 overflow-x-hidden'>
        {/* Logo */}
        <Link
          href={withLangPrefix(effectiveLang, '/')}
          aria-label={t.homeAria}
          onClick={handleLogoClick}
          className='flex items-center rounded-xl transition-transform duration-200 ease-out hover:-translate-y-0.3 hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
        >
          <Image
            src='/logo/paguro-logo-white.svg'
            alt='The Paguro Journey'
            width={100}
            height={100}
            className='h-7 sm:h-8 md:h-9 w-auto'
            priority
          />
        </Link>

        {/* Navigation */}
        <ul className='hidden md:flex items-center gap-6 text-white text-[clamp(0.7rem,1.1vw,0.9rem)]'>
          {navItems.map((item) => (
            <NavItem
              key={item.href}
              href={withLangPrefix(effectiveLang, item.href)}
              label={item.label}
              active={isActive(withLangPrefix(effectiveLang, item.href))}
              liClassName={LI_CLASS}
              linkClassName={LINK_CLASS}
              underlineBase={UNDERLINE_BASE}
              underlineInactive={UNDERLINE_INACTIVE}
              underlineActive={UNDERLINE_ACTIVE}
            />
          ))}
          <li>
            <Suspense fallback={null}>
              <SearchModal />
            </Suspense>
          </li>
          <li>
            <SwitchTheme />
          </li>
          <li>
            <LanguageToggle lang={effectiveLang} />
          </li>
        </ul>

        {/* Mobile controls */}
        <div className='flex md:hidden items-center gap-3 text-white'>
          <Suspense fallback={null}>
            <SearchModal />
          </Suspense>
          <SwitchTheme />

          <LanguageToggle lang={effectiveLang} />

          <button
            type='button'
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className='inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40'
          >
            {/* Simple hamburger / close icon */}
            <svg
              viewBox='0 0 24 24'
              className='h-6 w-6'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              {mobileOpen ? (
                <>
                  <path d='M18 6L6 18' />
                  <path d='M6 6l12 12' />
                </>
              ) : (
                <>
                  <path d='M3 6h18' />
                  <path d='M3 12h18' />
                  <path d='M3 18h18' />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen ? (
        <div className='md:hidden absolute top-12 left-0 right-0 bg-[color:var(--paguro-deep)]/95 backdrop-blur-sm border-t border-white/10'>
          <ul className='mx-auto max-w-6xl px-6 py-4 space-y-2 text-white'>
            {navItems.map((item) => {
              const active = isActive(withLangPrefix(effectiveLang, item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={withLangPrefix(effectiveLang, item.href)}
                    onClick={() => setMobileOpen(false)}
                    className={
                      'block rounded-xl px-3 py-3 text-base font-semibold transition ' +
                      (active
                        ? 'bg-white/10'
                        : 'hover:bg-white/10 active:bg-white/15')
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </nav>
  );
}
