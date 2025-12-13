'use client';
import { useState, useEffect } from 'react';

import Link from 'next/link';

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (!setIsSearchOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <>
      <nav className='fixed top-0 left-0 w-full z-30 bg-black/80 backdrop-blur-sm px-4 py-2'>
        <div className='flex items-center justify-between h-15 px-6'>
          {/* Logo + Title */}
          <Link
            href={'/'}
            aria-label='Go to homepage'
            className='flex items-center gap-1'
          >
            <div className='p-3'>
              <img src='/paguro.svg' alt='Logo' className='w-12 h-12' />
            </div>
            <p className='text-white text-xl tracking-wide'>
              The Paguro Journey
            </p>
          </Link>

          {/* Navigation */}
          <ul className='flex gap-10 text-white text-xl'>
            <li>
              <Link href={'/blog'}>Blog</Link>
            </li>
            <li>
              <Link href={'/destinations'}>Destinations</Link>
            </li>
            <li>
              <Link href={'/about'}>About</Link>
            </li>
            <li>
              <Link href={'/contact'}>Contact</Link>
            </li>
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label='Search'
              className='text-xl'
            >
              🔎
            </button>
          </ul>
        </div>
      </nav>
      {isSearchOpen && (
        <div
          role='dialog'
          aria-modal='true'
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40'
        >
          <div className='bg-white rounded p-6 w-11/12 max-w-md'>
            <button
              aria-label='Close search modal'
              onClick={() => setIsSearchOpen(false)}
              className='mb-4 text-black text-xl'
            >
              x
            </button>
            <input
              type='text'
              placeholder='Search...'
              className='w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring focus:ring-blue-500 text-black'
              autoFocus
            />
          </div>
        </div>
      )}
    </>
  );
}
