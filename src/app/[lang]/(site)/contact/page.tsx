import type { Metadata } from 'next';

import Link from 'next/link';
import type { ComponentType, SVGProps } from 'react';

import MailIcon from '@/components/icons/MailIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';

import NewsletterForm from '@/components/features/newsletter/NewsletterForm';

import { safeLang, type Lang } from '@/lib/route';

type PageProps = {
  params: Promise<{ lang: Lang }>;
};

function withLangPrefix(path: string, lang: Lang) {
  if (lang === 'en') return path.startsWith('/en') ? path : `/en${path}`;
  return path;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const meta = {
    it: {
      title: 'Contatti | The Paguro Journey',
      description:
        'Contatta The Paguro Journey per collaborazioni, progetti creativi, stampa o semplicemente per salutarci. Email e social ufficiali.',
      ogAlt: 'The Paguro Journey – Contatti',
    },
    en: {
      title: 'Contact | The Paguro Journey',
      description:
        'Contact The Paguro Journey for collaborations, creative projects, press inquiries, or just to say hi. Official email and social channels.',
      ogAlt: 'The Paguro Journey – Contact',
    },
  } as const;

  const m = meta[effectiveLang];

  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: withLangPrefix('/contact', effectiveLang) },
    openGraph: {
      title: m.title,
      description: m.description,
      url: withLangPrefix('/contact', effectiveLang),
      siteName: 'The Paguro Journey',
      type: 'website',
      images: [
        {
          url: '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: m.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.description,
      images: ['/og-default.jpg'],
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const copy = {
    it: {
      h1: 'Contatti',
      subtitle:
        'Per collaborazioni, idee o anche solo per salutarci — scrivici senza problemi.',
      ariaOptions: 'Opzioni di contatto',
      emailSub: 'Il modo più rapido per contattarci.',
      ytSub: 'I nostri viaggi, raccontati in video.',
      igSub: 'Storie, dietro le quinte e aggiornamenti.',
      ttSub: 'Momenti di viaggio, brevi e spontanei.',
      emailTitle: 'Email',
      ytTitle: 'YouTube',
      igTitle: 'Instagram',
      ttTitle: 'TikTok',
      emailAria: 'Scrivici una email',
      ytAria: 'Visita il nostro canale YouTube',
      igAria: 'Visita il nostro profilo Instagram',
      ttAria: 'Visita il nostro profilo TikTok',
      mediaKitPrefix:
        'Per collaborazioni, stampa e partnership puoi consultare il nostro',
      mediaKitLink: 'Media Kit',
    },
    en: {
      h1: 'Contact',
      subtitle:
        'For collaborations, ideas, or even just to say hi — feel free to reach out.',
      ariaOptions: 'Contact options',
      emailSub: 'The quickest way to reach us.',
      ytSub: 'Our journeys, told through video.',
      igSub: 'Stories, behind-the-scenes, and updates.',
      ttSub: 'Travel moments — short and spontaneous.',
      emailTitle: 'Email',
      ytTitle: 'YouTube',
      igTitle: 'Instagram',
      ttTitle: 'TikTok',
      emailAria: 'Send us an email',
      ytAria: 'Visit our YouTube channel',
      igAria: 'Visit our Instagram profile',
      ttAria: 'Visit our TikTok profile',
      mediaKitPrefix:
        'For collaborations, press, and partnerships you can check our',
      mediaKitLink: 'Media Kit',
    },
  } as const;

  const t = copy[effectiveLang];

  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-3xl space-y-12'>
        {/* Page header: H1 + value proposition for search engines */}
        <header className='space-y-4'>
          <h1 className='t-page-title'>{t.h1}</h1>
          <p className='t-page-subtitle'>{t.subtitle}</p>
        </header>

        {/* Primary contact channels: email and social platforms */}
        <section
          aria-label={t.ariaOptions}
          className='grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6'
        >
          <ContactCard
            href='mailto:thepagurojourney@gmail.com'
            title={t.emailTitle}
            ariaLabel={t.emailAria}
            subtitle={t.emailSub}
            Icon={MailIcon}
          />

          <ContactCard
            href='https://www.youtube.com/@thepagurojourney'
            title={t.ytTitle}
            ariaLabel={t.ytAria}
            subtitle={t.ytSub}
            Icon={YouTubeIcon}
            external
          />

          <ContactCard
            href='https://www.instagram.com/the_paguro_journey/'
            title={t.igTitle}
            ariaLabel={t.igAria}
            subtitle={t.igSub}
            Icon={InstagramIcon}
            external
          />

          <ContactCard
            href='https://www.tiktok.com/login?redirect_url=https%3A%2F%2Fwww.tiktok.com%2F%40the_paguro_journey&lang=en&enter_method=mandatory'
            title={t.ttTitle}
            ariaLabel={t.ttAria}
            subtitle={t.ttSub}
            Icon={TikTokIcon}
            external
          />
        </section>

        {/* Newsletter signup: secondary conversion action */}
        <NewsletterForm lang={effectiveLang} />
        <section className='mt-10 text-center text-sm text-[color:var(--paguro-text-muted)]'>
          <p>
            {t.mediaKitPrefix}{' '}
            <a
              href='/media-kit/mediakit.pdf'
              target='_blank'
              rel='noopener noreferrer'
              className='font-semibold [font-family:var(--font-ui)] text-[color:var(--paguro-meadia-kit)] underline-offset-4 hover:underline'
            >
              {t.mediaKitLink}
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* ContactCard                                                                 */
/* -------------------------------------------------------------------------- */

function cx(...classes: Array<string | undefined | null | false>) {
  return classes.filter(Boolean).join(' ');
}

function ContactCard({
  href,
  title,
  ariaLabel,
  subtitle,
  Icon,
  external,
  className,
}: {
  href: string;
  title: string;
  ariaLabel: string;
  subtitle: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  external?: boolean;
  className?: string;
}) {
  const containerClass = [
    'flex flex-col items-center justify-start text-center',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const ICON_BASE = cx(
    'relative isolate grid h-16 w-16 place-items-center overflow-hidden rounded-2xl',
    'backdrop-blur-lg',
    'border border-white/35',
    "before:content-[''] before:pointer-events-none before:absolute before:inset-0 before:z-0 before:opacity-0 before:bg-[radial-gradient(120%_100%_at_20%_10%,rgba(255,255,255,0.52),transparent_60%)] before:transition-opacity before:duration-200 hover:before:opacity-100",
    "after:content-[''] after:pointer-events-none after:absolute after:inset-0 after:z-10 after:opacity-0 after:bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.22),transparent)] after:bg-[length:200%_200%] after:bg-[position:120%_0%] after:blur-[0.5px] after:mix-blend-overlay after:transition-[background-position,opacity] after:duration-350 after:ease-out hover:after:opacity-5 hover:after:bg-[position:-50%_100%] motion-reduce:after:transition-none",
    // Removed fixed shadow lines here as per instructions
    'transition-[transform,box-shadow,background] duration-200',
    // 'hover:shadow-[0_14px_36px_rgba(0,0,0,0.24)]', // removed line
    'active:scale-[0.95]',
    'active:shadow-[0_8px_22px_rgba(0,0,0,0.22)]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50',
    'motion-reduce:transition-none'
  );

  // pick a tint based on title (simple + reliable)
  const tint =
    title === 'Email'
      ? 'bg-gradient-to-b from-sky-500/22 to-sky-500/10 hover:from-sky-500/26 hover:to-sky-500/12'
      : title === 'YouTube'
      ? 'bg-gradient-to-b from-red-500/24 to-red-500/10 hover:from-red-500/28 hover:to-red-500/12'
      : title === 'Instagram'
      ? 'bg-gradient-to-b from-pink-500/22 to-purple-500/12 hover:from-pink-500/26 hover:to-purple-500/14'
      : title === 'TikTok'
      ? 'bg-gradient-to-b from-cyan-400/20 to-fuchsia-400/12 hover:from-cyan-400/24 hover:to-fuchsia-400/14'
      : 'bg-gradient-to-b from-white/40 to-white/14 hover:from-white/46 hover:to-white/16';

  const shadowTint =
    title === 'Email'
      ? 'shadow-[0_8px_20px_rgba(56,189,248,0.28)] hover:shadow-[0_12px_28px_rgba(56,189,248,0.38)]'
      : title === 'YouTube'
      ? 'shadow-[0_8px_20px_rgba(239,68,68,0.28)] hover:shadow-[0_12px_28px_rgba(239,68,68,0.38)]'
      : title === 'Instagram'
      ? 'shadow-[0_8px_20px_rgba(236,72,153,0.28)] hover:shadow-[0_12px_28px_rgba(236,72,153,0.38)]'
      : title === 'TikTok'
      ? 'shadow-[0_8px_20px_rgba(34,211,238,0.28)] hover:shadow-[0_12px_28px_rgba(34,211,238,0.38)]'
      : 'shadow-[0_8px_20px_rgba(0,0,0,0.22)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.30)]';

  const iconColor =
    title === 'Email'
      ? 'text-sky-500'
      : title === 'YouTube'
      ? 'text-red-500'
      : title === 'Instagram'
      ? 'text-pink-500'
      : title === 'TikTok'
      ? 'text-cyan-400'
      : 'text-[color:var(--paguro-icon-fg)]';

  const icon = (
    <div className={cx(ICON_BASE, tint, shadowTint, iconColor)}>
      <Icon className='relative z-20 h-9 w-9' />
    </div>
  );

  const linkedIcon = external ? (
    <a
      href={href}
      target='_blank'
      rel='noopener noreferrer'
      aria-label={ariaLabel}
    >
      {icon}
    </a>
  ) : href.startsWith('mailto:') ? (
    <a href={href} aria-label={ariaLabel}>
      {icon}
    </a>
  ) : (
    <Link href={href} aria-label={ariaLabel}>
      {icon}
    </Link>
  );

  const content = (
    <div className={containerClass}>
      {linkedIcon}

      <div className='mt-4 space-y-1'>
        <div className='[font-family:var(--font-ui)] text-lg font-semibold text-[color:var(--paguro-text)]'>
          {title}
        </div>
        <div className='text-xs text-[color:var(--paguro-text-muted)]'>
          {subtitle}
        </div>
      </div>
    </div>
  );

  return content;
}
