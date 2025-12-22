'use client';
import { usePathname } from 'next/navigation';

import SearchModal from './SearchModal';

import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const ACTIVE_CLASS =
    'inline-flex items-center px-3 py-1 rounded-3xl transition-colors duration-500 bg-white/20 hover:text-[color:var(--paguro-text-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 font-semibold';
  const NORMAL_CLASS =
    'inline-flex items-center px-3 py-1 rounded-3xl transition-colors duration-500 hover:bg-white/20 hover:text-[color:var(--paguro-text-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50';

  return (
    <>
      <nav className='fixed top-0 right-0 left-0 z-50 [font-family:var(--font-ui)] font-medium bg-[color:var(--paguro-deep)]/80 backdrop-blur-sm'>
        <div className='flex items-center justify-between h-16 px-6'>
          {/* Logo + Title */}
          <Link
            href={'/'}
            aria-label='Go to homepage'
            className='flex items-center gap-1'
          >
            <div className='p-3'>
              <Image
                src='/logo/paguro_logo_orange.svg'
                alt='Logo'
                width={100}
                height={100}
              />
            </div>
          </Link>

          {/* Navigation */}
          <ul className='flex gap-10 text-white text-xl'>
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
                className={isActive('/destinations') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Destinations
              </Link>
            </li>
            <li>
              <Link
                href='/about'
                className={isActive('/about') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href={'/contact'}
                className={isActive('/contact') ? ACTIVE_CLASS : NORMAL_CLASS}
              >
                Contact
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
