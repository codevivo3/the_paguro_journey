'use client';
import { usePathname } from 'next/navigation';

import SearchModal from '../ui/SearchModal';

import Link from 'next/link';
import Image from 'next/image';

import SwitchTheme from '../features/theme/ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const ACTIVE_CLASS =
    'inline-flex items-center justify-center h-9.5 px-3 py-1 rounded-3xl transition-colors duration-300 bg-radial-[at_50%_75%] from-white/20 via-[color:var(--paguro-ocean)]/10 to-[color:var(--paguro-ocean)]/25 to-90%  border border-white/20 hover:text-[color:var(--paguro-text-light)] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 shadow-sm';
  const NORMAL_CLASS =
    'inline-flex items-center justify-center h-9.5 px-3 py-1 rounded-3xl transition-colors duration-500 hover:bg-radial-[at_50%_75%] hover:from-white/15 hover:via-[color:var(--paguro-ocean)]/20 hover:to-[color:var(--paguro-ocean)]/30 hover:to-90% hover:shadow-sm hover:text-[color:var(--paguro-text-light)] hover:border border-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

  return (
    <>
      <nav className='fixed top-0 right-0 left-0 z-50 [font-family:var(--font-ui)] font-medium bg-[color:var(--paguro-deep)]/80 backdrop-blur-sm'>
        <div className='mx-auto flex max-w-6xl items-center justify-between h-16 px-6 lg:px-12'>
          {/* Logo + Title */}
          <Link
            href='/'
            aria-label='Go to homepage'
            className='flex items-center rounded-xl transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:scale-110 active:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
          >
            <Image
              src='/logo/paguro-logo-white.svg'
              alt='The Paguro Journey'
              width={100}
              height={100}
              className='h-10 sm:h-11 md:h-12 w-auto '
              priority
            />
          </Link>

          {/* Navigation */}
          <ul className='flex items-center gap-6 text-white text-[clamp(0.8rem,1.2vw,1rem)]'>
            <li>
              <Link
                href={'/blog'}
                className={isActive('/blog') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Blog
              </Link>
            </li>
            <li>
              <Link
                href={'/destinations'}
                className={
                  isActive('/destinations') ? ACTIVE_CLASS : NORMAL_CLASS
                }
              >
                Destinazioni
              </Link>
            </li>
            <li>
              <Link
                href={'/gallery'}
                className={isActive('/gallery') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Galleria
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className={isActive('/about') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Chi Siamo
              </Link>
            </li>
            <li>
              <Link
                href={'/contact'}
                className={isActive('/contact') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Contatti
              </Link>
            </li>
            <li>
              <SearchModal />
            </li>
            <li>
              <SwitchTheme />
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
