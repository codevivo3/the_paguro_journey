import Link from 'next/link';

import NewsletterForm from '@/components/NewsletterForm';
import MailIcon from '@/components/icons/MailIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';

function ContactCard({
  href,
  title,
  subtitle,
  Icon,
  external,
}: {
  href: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  external?: boolean;
}) {
  const content = (
    <div className='group aspect-square rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-2 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md'>
      <div className='flex h-full flex-col items-center justify-center text-center'>
        <div className='grid h-14 w-14 place-items-center rounded-2xl bg-white text-[color:var(--paguro-ocean)] transition-colors duration-300 group-hover:text-[color:var(--paguro-coral)] border'>
          <Icon className='h-7 w-7' />
        </div>

        <div className='mt-4 space-y-1'>
          <div className='[font-family:var(--font-ui)] text-lg font-semibold text-[color:var(--paguro-text)]'>
            {title}
          </div>
          <div className='text-xs text-[color:var(--paguro-text-muted)]'>
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  );

  if (external) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='block h-full'
      >
        {content}
      </a>
    );
  }

  // mailto: should be a normal <a>
  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className='block h-full'>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className='block h-full'>
      {content}
    </Link>
  );
}

export default function ContactPage() {
  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-3xl space-y-12'>
        {/* Page header */}
        <header className='space-y-4'>
          <h1 className='t-page-title'>Contatti</h1>
          <p className='t-page-subtitle'>
            Per collaborazioni, idee o anche solo per salutarci — scrivici senza
            problemi.
          </p>
        </header>

        {/* Contact options */}
        <section
          aria-label='Contact options'
          className='grid grid-cols-2 gap-5 md:grid-cols-4 md:gap-6'
        >
          <ContactCard
            href='mailto:thepagurojourney@gmail.com'
            title='Email'
            subtitle='Il modo più rapido per contattarci.'
            Icon={MailIcon}
          />

          <ContactCard
            href='https://www.youtube.com/@thepagurojourney'
            title='YouTube'
            subtitle='I nostri viaggi, raccontati in video.'
            Icon={YouTubeIcon}
            external
          />

          <ContactCard
            href='https://www.instagram.com/the_paguro_journey/'
            title='Instagram'
            subtitle='Storie, dietro le quinte e aggiornamenti.'
            Icon={InstagramIcon}
            external
          />

          <ContactCard
            href='https://www.tiktok.com/login?redirect_url=https%3A%2F%2Fwww.tiktok.com%2F%40the_paguro_journey&lang=en&enter_method=mandatory'
            title='TikTok'
            subtitle='Momenti di viaggio, brevi e spontanei.'
            Icon={TikTokIcon}
            external
          />
        </section>

        {/* Newsletter (optional) */}
        <NewsletterForm />
      </div>
    </main>
  );
}
