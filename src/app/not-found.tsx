import Link from 'next/link';
import HermitCrabLottie from '@/components/lottie/HermitCrabLottie';

// Custom App Router 404 page
export default function NotFound() {
  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        {/* Playful visual cue for a missing page: Hermit Crab Lottie animation */}

        {/* HTTP error code */}
        <h1 className='[font-family:var(--font-ui)] text-4xl tracking-wide text-[color:var(--paguro-text-dark)]/60'>
          404
        </h1>
        <HermitCrabLottie className='crab-run' />

        {/* User-facing message */}
        <h1 className='[font-family:var(--font-editorial)] text-3xl font-semibold text-[color:var(--paguro-text-dark)]'>
          Page not found
        </h1>

        {/* Gently guides users back into the site */}
        <p className='text-[color:var(--paguro-text-dark)]/75'>
          La pagina che stavi cercando non esiste, viaggia verso altre
          destinazioni del nostro sito!
        </p>

        {/* Primary recovery action: return home */}
        <div className='flex items-center justify-center gap-3'>
          <Link
            href='/'
            className='rounded-full bg-[color:var(--paguro-deep)] px-5 py-2 text-[color:var(--paguro-text-light)] transition-colors hover:bg-[color:var(--paguro-coral)]'
          >
            Home Page
          </Link>
        </div>
      </div>
    </main>
  );
}
