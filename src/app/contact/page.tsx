import Link from 'next/link';

import NewsletterForm from '@/components/NewsletterForm';

function IconMail(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      {...props}
    >
      <path
        d='M4 7.5C4 6.67157 4.67157 6 5.5 6H18.5C19.3284 6 20 6.67157 20 7.5V16.5C20 17.3284 19.3284 18 18.5 18H5.5C4.67157 18 4 17.3284 4 16.5V7.5Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M5.5 7.5L12 12.2L18.5 7.5'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function IconInstagram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      {...props}
    >
      <path
        d='M8 3.5H16C18.4853 3.5 20.5 5.51472 20.5 8V16C20.5 18.4853 18.4853 20.5 16 20.5H8C5.51472 20.5 3.5 18.4853 3.5 16V8C3.5 5.51472 5.51472 3.5 8 3.5Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M12 16.25C14.3472 16.25 16.25 14.3472 16.25 12C16.25 9.65279 14.3472 7.75 12 7.75C9.65279 7.75 7.75 9.65279 7.75 12C7.75 14.3472 9.65279 16.25 12 16.25Z'
        stroke='currentColor'
        strokeWidth='1.7'
      />
      <path
        d='M17.25 6.95H17.26'
        stroke='currentColor'
        strokeWidth='2.4'
        strokeLinecap='round'
      />
    </svg>
  );
}

function IconYouTube(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      aria-hidden='true'
      {...props}
    >
      <path
        d='M21 12.1C21 12.1 21 9.4 20.6 8.2C20.4 7.5 19.8 7 19.1 6.8C17.8 6.5 12 6.5 12 6.5C12 6.5 6.2 6.5 4.9 6.8C4.2 7 3.6 7.5 3.4 8.2C3 9.4 3 12.1 3 12.1C3 12.1 3 14.8 3.4 16C3.6 16.7 4.2 17.2 4.9 17.4C6.2 17.7 12 17.7 12 17.7C12 17.7 17.8 17.7 19.1 17.4C19.8 17.2 20.4 16.7 20.6 16C21 14.8 21 12.1 21 12.1Z'
        stroke='currentColor'
        strokeWidth='1.7'
        strokeLinejoin='round'
      />
      <path
        d='M10.2 9.7L15.5 12.1L10.2 14.5V9.7Z'
        fill='currentColor'
      />
    </svg>
  );
}

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
  Icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  external?: boolean;
}) {
  const content = (
    <div className='flex items-center justify-between gap-6 rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md'>
      <div className='flex items-center gap-4'>
        <div className='grid h-11 w-11 place-items-center rounded-xl bg-black/5 text-[color:var(--paguro-deep)]'>
          <Icon className='h-6 w-6' />
        </div>

        <div className='space-y-0.5'>
          <div className='[font-family:var(--font-ui)] text-lg font-semibold text-[color:var(--paguro-text-dark)]'>
            {title}
          </div>
          <div className='text-sm text-[color:var(--paguro-text-dark)]/70'>
            {subtitle}
          </div>
        </div>
      </div>

      <span
        className='text-[color:var(--paguro-text-dark)]/60 [font-family:var(--font-ui)]'
        aria-hidden='true'
      >
        ➜
      </span>
    </div>
  );

  if (external) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className='block'>
        {content}
      </a>
    );
  }

  // mailto: should be a normal <a>
  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className='block'>
        {content}
      </a>
    );
  }

  return <Link href={href}>{content}</Link>;
}

export default function ContactPage() {
  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-3xl space-y-12'>
        {/* Page header */}
        <header className='space-y-4'>
          <h1 className='[font-family:var(--font-ui)] text-4xl font-semibold text-[color:var(--paguro-text-dark)]'>
            Contact
          </h1>
          <p className='text-[color:var(--paguro-text-dark)]/70'>
            For collaborations, ideas, or just to say hello — feel free to reach
            out.
          </p>
        </header>

        {/* Contact options */}
        <section aria-label='Contact options' className='space-y-4'>
          <ContactCard
            href='mailto:hello@thepagurojourney.com'
            title='Email'
            subtitle='The fastest way to reach us.'
            Icon={IconMail}
          />

          <ContactCard
            href='https://instagram.com/thepagurojourney'
            title='Instagram'
            subtitle='Stories, behind the scenes, and updates.'
            Icon={IconInstagram}
            external
          />

          <ContactCard
            href='https://www.youtube.com/@thepagurojourney'
            title='YouTube'
            subtitle='Watch the latest adventures.'
            Icon={IconYouTube}
            external
          />
        </section>

        {/* Newsletter (optional) */}
        <NewsletterForm />
      </div>
    </main>
  );
}
