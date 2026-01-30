'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { withLangPrefix, safeLang, type Lang } from '@/lib/route';

import TikTokIcon from '../icons/TikTokIcon';
import InstagramIcon from '../icons/InstagramIcon';
import YouTubeIcon from '../icons/YouTubeIcon';
import MailIcon from '../icons/MailIcon';

type FooterProps = {
  lang?: Lang;

  /** Optional Sanity‑resolved copy overrides */
  tagline?: string;
  blog?: string;
  destinations?: string;
  about?: string;
  contact?: string;
  mediaKit?: string;
};

export default function Footer({
  lang,
  tagline,
  blog,
  destinations,
  about,
  contact,
  mediaKit,
}: FooterProps) {
  const pathname = usePathname() || '/';
  const effectiveLang: Lang = safeLang(
    lang ?? (pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'it'),
  );

  const href = useMemo(
    () => ({
      home: withLangPrefix(effectiveLang, '/'),
      blog: withLangPrefix(effectiveLang, '/blog'),
      destinations: withLangPrefix(effectiveLang, '/destinations'),
      about: withLangPrefix(effectiveLang, '/about'),
      contact: withLangPrefix(effectiveLang, '/contact'),
      mediaKit: withLangPrefix(effectiveLang, '/media-kit'),
    }),
    [effectiveLang],
  );

  const copy = {
    it: {
      tagline: 'Viaggi consapevoli, destinazioni fuori rotta.',
      blog: 'Blog',
      destinations: 'Destinazioni',
      about: 'Chi Siamo',
      contact: 'Contatti',
      mediaKit: 'Media Kit',
      ariaEmail: 'Email',
    },
    en: {
      tagline: 'Mindful travel, off-the-beaten-path destinations.',
      blog: 'Blog',
      destinations: 'Destinations',
      about: 'About',
      contact: 'Contact',
      mediaKit: 'Media Kit',
      ariaEmail: 'Email',
    },
  } as const;

  const fallback = copy[effectiveLang];

  const t = {
    tagline: tagline ?? fallback.tagline,
    blog: blog ?? fallback.blog,
    destinations: destinations ?? fallback.destinations,
    about: about ?? fallback.about,
    contact: contact ?? fallback.contact,
    mediaKit: mediaKit ?? fallback.mediaKit,
    ariaEmail: fallback.ariaEmail,
  } as const;

  return (
    <footer className='mt-8 md:mt-12 border-t border-[color:var(--paguro-border)] bg-[color:var(--paguro-footer)] py-10 md:py-12 text-[color:var(--paguro-text)]'>
      <div className='mx-auto max-w-5xl grid gap-8 px-4 md:px-6 md:grid-cols-3'>
        {/* Identity */}
        <div className='space-y-2 text-center md:text-left'>
          <Link
            href={href.home}
            className='text-lg [font-family:var(--font-ui)] font-semibold transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            The Paguro Journey
          </Link>
          <p className='mt-2 text-xs text-[color:var(--paguro-text)]/70'>
            {t.tagline}
          </p>
        </div>

        {/* Navigation */}
        <nav className='flex flex-col items-center gap-2 text-xs'>
          <Link
            href={href.blog}
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            {t.blog}
          </Link>
          <Link
            href={href.destinations}
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            {t.destinations}
          </Link>
          <Link
            href={href.about}
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            {t.about}
          </Link>
          <Link
            href={href.contact}
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            {t.contact}
          </Link>
          <Link
            href={href.mediaKit}
            className='transition-colors hover:text-[color:var(--paguro-coral)]'
          >
            {t.mediaKit}
          </Link>
        </nav>

        {/* Social */}
        <div className='flex flex-col items-center md:items-end md:justify-self-end'>
          <div className='flex items-center gap-4'>
            <a
              href='mailto:thepagurojourney@gmail.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label={t.ariaEmail}
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <MailIcon className='h-6 w-6 md:h-6.5 md:w-6.5' />
            </a>
            <a
              href='https://www.youtube.com/@thepagurojourney'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='YouTube'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              <YouTubeIcon className='h-7 w-7' />
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
              <TikTokIcon className='h-5 w-5 md:h-4.5 md:w-4.5' />
            </a>
          </div>
        </div>
      </div>

      <div className='mt-6 md:mt-8 text-center text-[0.65rem] md:text-[0.7rem] t-meta'>
        © {new Date().getFullYear()} The Paguro Journey
      </div>
    </footer>
  );
}
