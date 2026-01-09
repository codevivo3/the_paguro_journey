import { ContactCard } from '@/components/ui/Card';

import MailIcon from '@/components/icons/MailIcon';
import YouTubeIcon from '@/components/icons/YouTubeIcon';
import InstagramIcon from '@/components/icons/InstagramIcon';
import TikTokIcon from '@/components/icons/TikTokIcon';

import NewsletterForm from '@/components/features/newsletter/NewsletterForm';

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
