'use client';
import { usePathname } from 'next/navigation';

import SearchModal from './SearchModal';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const ACTIVE_CLASS =
    'inline-flex items-center px-3 py-1 rounded-3xl transition-colors duration-500 bg-white/20 hover:text-[color:var(--paguro-text-light)] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 font-semibold';
  const NORMAL_CLASS =
    'inline-flex items-center px-3 py-1 rounded-3xl transition-colors duration-500 hover:bg-white/20 hover:text-[color:var(--paguro-text-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

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
              src='/logo/paguro-logo-orange.svg'
              alt='The Paguro Journey'
              width={100}
              height={100}
              className='h-10 sm:h-11 md:h-12 w-auto drop-shadow-sm'
              priority
            />
          </Link>

          {/* Navigation */}
          <ul className='flex items-center gap-6 text-white text-[clamp(1rem,1.4vw,1.3rem)]'>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
