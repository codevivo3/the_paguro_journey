import type { Metadata } from 'next';

import { ContactCard } from '@/components/ui/Card';

import MailIcon from '@/components/icons/MailIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';

import NewsletterForm from '@/components/features/newsletter/NewsletterForm';

export const metadata: Metadata = {
  title: "Contatti | The Paguro Journey",
  description: "Contatta The Paguro Journey per collaborazioni, progetti creativi, stampa o semplicemente per salutarci. Email e social ufficiali.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contatti | The Paguro Journey",
    description: "Contatta The Paguro Journey per collaborazioni, progetti creativi, stampa o semplicemente per salutarci. Email e social ufficiali.",
    url: "/contact",
    siteName: "The Paguro Journey",
    type: "website",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "The Paguro Journey – Contatti",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contatti | The Paguro Journey",
    description: "Contatta The Paguro Journey per collaborazioni, progetti creativi, stampa o semplicemente per salutarci. Email e social ufficiali.",
    images: ["/og-default.jpg"],
  },
};

export default function ContactPage() {
  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-3xl space-y-12'>
        {/* Page header: H1 + value proposition for search engines */}
        <header className='space-y-4'>
          <h1 className='t-page-title'>Contatti</h1>
          <p className='t-page-subtitle'>
            Per collaborazioni, idee o anche solo per salutarci — scrivici senza
            problemi.
          </p>
        </header>

        {/* Primary contact channels: email and social platforms */}
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

        {/* Newsletter signup: secondary conversion action */}
        <NewsletterForm />
      </div>
    </main>
  );
}
