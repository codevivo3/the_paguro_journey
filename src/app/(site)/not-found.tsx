import type { Metadata } from 'next';
import HermitCrabLottie from '@/components/lottie/HermitCrabLottie';

import Button from '@/components/ui/Button';

// Custom App Router 404 page optimized for user experience and brand consistency
export const metadata: Metadata = {
  title: "404 – Pagina non trovata | The Paguro Journey",
  description: "La pagina che stai cercando non esiste. Torna a esplorare le destinazioni, i racconti di viaggio e i contenuti di The Paguro Journey.",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        {/* Playful recovery visual: Hermit Crab Lottie animation to soften the error experience */}

        {/* HTTP error code display */}
        <h1 className='t-meta text-4xl tracking-wide'>
          404
        </h1>
        <HermitCrabLottie className='crab-run' />

        {/* Clear user-facing message indicating the page was not found */}
        <h1 className='t-page-title'>
          Page not found
        </h1>

        {/* Guiding users back to explore other destinations and content */}
        <p className='t-body'>
          La pagina che stavi cercando non esiste, viaggia verso altre
          destinazioni del nostro sito!
        </p>

        {/* Primary action to help users return to the homepage */}
        <div className='flex items-center justify-center gap-3'>
          <Button
            href='/'
            className='rounded-full bg-[color:var(--paguro-ocean)] px-5 py-2 text-[color:var(--paguro-text-light)] transition-colors hover:bg-[color:var(--paguro-coral)]'
          >
            Home Page
          </Button>
        </div>
      </div>
    </main>
  );
}
