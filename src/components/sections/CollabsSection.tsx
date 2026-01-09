import Link from 'next/link';
import Image from 'next/image';

import { collaborations } from '@/lib/collabs';

export default function CollabsSection() {
  return (
    <section className='px-6 pb-24 pt-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section header: title + short intro */}
        <header className='text-center space-y-3'>
          <h2 className='t-section-title text-center'>
            Collaborazioni
          </h2>
          <p className='t-body mx-auto max-w-2xl'>
            Progetti e realtà con cui abbiamo collaborato nel tempo.
          </p>
        </header>

        {/* Collaborations list
            - Flex-based layout to keep items centered regardless of count
            - Fixed card width for visual balance
        */}
        <ul className='mx-auto flex max-w-4xl flex-wrap justify-center gap-4 sm:gap-5'>
          {collaborations.map((c) => (
            <li key={c.name} className='w-[220px] sm:w-[240px]'>
              <Link
                href={c.url}
                target='_blank'
                rel='noopener noreferrer'
                aria-label={`Apri collaborazione: ${c.name}`}
                className='group flex items-center justify-center rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] px-4 py-5 shadow-sm transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-border)]'
              >
                {/* Fixed-height logo container
                    Keeps logos vertically aligned even with different aspect ratios
                */}
                <div className='relative h-20 w-full max-w-[140px]'>
                  <Image
                    src={c.logoSrc}
                    alt={c.logoAlt ?? c.name}
                    fill
                    sizes='140px'
                    className='object-contain opacity-75 transition-opacity duration-300 group-hover:opacity-100'
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>

        {/* Optional micro-CTA
            Lightweight prompt for future contact or collaborations
        */}
        <div className='text-center'>
          <p className='t-meta'>
            Vuoi collaborare?{' '}
            <a
              href='mailto:thepagurojourney@gmail.com'
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Email'
              className='inline-flex transition-colors duration-200 hover:text-[color:var(--paguro-coral)]'
            >
              Scrivici ➜
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
