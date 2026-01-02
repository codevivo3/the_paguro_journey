import Link from 'next/link';

import TikTokIcon from './icons/TikTokIcon';
import InstagramIcon from './icons/InstagramIcon';
import YouTubeIcon from './icons/YouTubeIcon';
import MailIcon from './icons/MailIcon';

export default function Footer() {
  return (
    <footer className='mt-32 border-t border-black/10 bg-white py-16 text-[color:var(--paguro-text-dark)]'>
      <div className='mx-auto max-w-5xl px-6 grid gap-10 md:grid-cols-3'>
        {/* Identity */}
        <div className='space-y-2'>
          <Link
            href={'/'}
            className='text-xl [font-family:var(--font-ui)] font-semibold transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            The Paguro Journey
          </Link>
          <p className='mt-2 text-sm text-[color:var(--paguro-text-dark)]/70'>
            Viaggi consapevoli, destinazioni fuori rotta.
          </p>
        </div>

        {/* Navigation */}
        <nav className='flex flex-col items-center gap-2 text-sm'>
          <Link
            href='/blog'
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            Blog
          </Link>
          <Link
            href='/destinations'
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            Destinazioni
          </Link>
          <Link
            href='/about'
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            Chi Siamo
          </Link>
          <Link
            href='/contact'
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            Contatti
          </Link>
        </nav>

        {/* Social */}
        <div className='flex flex-col items-center'>
          <div className='flex items-center gap-5'>
            <a
              href='mailto:thepagurojourney@gmail.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Email'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <MailIcon className='h-5 w-5' />
            </a>
            <a
              href='https://www.youtube.com/@thepagurojourney'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='YouTube'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <YouTubeIcon className='h-5 w-5' />
            </a>
            <a
              href='https://www.instagram.com/the_paguro_journey/'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Instagram'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <InstagramIcon className='h-5 w-5' />
            </a>
            <a
              href='https://www.tiktok.com/login?redirect_url=https%3A%2F%2Fwww.tiktok.com%2F%40the_paguro_journey&lang=en&enter_method=mandatory'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='TikTok'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <TikTokIcon className='h-5 w-5' />
            </a>
          </div>
        </div>
      </div>

      <div className='mt-12 text-center text-xs opacity-50'>
        © {new Date().getFullYear()} The Paguro Journey
      </div>
    </footer>
  );
}
