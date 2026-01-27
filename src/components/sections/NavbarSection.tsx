'use client';
import { Suspense, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import SearchModal from '../ui/SearchModal';
import SwitchTheme from '../features/theme/ThemeToggle';

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
      <Link href={href} className={linkClassName}>
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

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

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

  return (
    <nav className='fixed top-0 right-0 left-0 z-[9999] isolate [font-family:var(--font-ui)] bg-[color:var(--paguro-deep)]/80 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between h-12 px-6 lg:px-12 overflow-x-hidden'>
        {/* Logo */}
        <Link
          href='/'
          aria-label='Go to homepage'
          onClick={() => setMobileOpen(false)}
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
          <NavItem
            href='/blog'
            label='Blog'
            active={isActive('/blog')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/destinations'
            label='Destinazioni'
            active={isActive('/destinations')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/gallery'
            label='Galleria'
            active={isActive('/gallery')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/about'
            label='Chi Siamo'
            active={isActive('/about')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/contact'
            label='Contatti'
            active={isActive('/contact')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <li>
            <Suspense fallback={null}>
              <SearchModal />
            </Suspense>
          </li>
          <li>
            <SwitchTheme />
          </li>
        </ul>

        {/* Mobile controls */}
        <div className='flex md:hidden items-center gap-3 text-white'>
          <Suspense fallback={null}>
            <SearchModal />
          </Suspense>
          <SwitchTheme />

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
            {[
              { href: '/blog', label: 'Blog' },
              { href: '/destinations', label: 'Destinazioni' },
              { href: '/gallery', label: 'Galleria' },
              { href: '/about', label: 'Chi Siamo' },
              { href: '/contact', label: 'Contatti' },
            ].map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={
                      'block rounded-xl px-3 py-3 text-base font-semibold transition ' +
                      (active ? 'bg-white/10' : 'hover:bg-white/10 active:bg-white/15')
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
