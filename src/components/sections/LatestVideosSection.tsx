/****
 * LatestVideosSection
 *
 * Displays the most recent YouTube videos using a horizontal carousel.
 * Includes a direct link to the Paguro Journey YouTube channel.
 */
import { getLatestRegularVideos } from '@/lib/youtube';
import VideoCarousel from '@/components/features/videos/VideoCarousel.client';

export default async function LatestVidsSection() {
  // Server-side fetch: keeps API keys and quota logic out of the client bundle
  const latestVideos = await getLatestRegularVideos(15);

  return (
    <section className='px-6 py-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <header className='space-y-3'>
          <div className='flex flex-col items-center justify-center gap-3'>
            <h3 className='t-page-title title-divider title-divider-center'>
              Ultimi Video
            </h3>
            <a
              href='https://www.youtube.com/@thepagurojourney'
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center justify-center rounded-md bg-white/80 p-1.5 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-ocean)]/40'
              aria-label='Visita il canale YouTube di The Paguro Journey'
            >
              {/*
                YouTube logo (inline SVG):
                - red rounded rectangle background
                - white play triangle as a separate path
                This allows precise control over color and shadows.
              */}
              <svg
                className='block h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 drop-shadow-sm transition-transform duration-300 hover:scale-[1.08] active:scale-[0.95]'
                viewBox='0 0 640 640'
                preserveAspectRatio='xMidYMid meet'
                focusable='false'
                aria-hidden='true'
                role='img'
              >
                <path
                  fill='#ff0233'
                  d='M581.7 188.1C575.5 164.4 556.9 145.8 533.4 139.5C490.9 128 320.1 128 320.1 128C320.1 128 149.3 128 106.7 139.5C83.2 145.8 64.7 164.4 58.4 188.1C47 231 47 320.4 47 320.4C47 320.4 47 409.8 58.4 452.7C64.7 476.3 83.2 494.2 106.7 500.5C149.3 512 320.1 512 320.1 512C320.1 512 490.9 512 533.5 500.5C557 494.2 575.5 476.3 581.8 452.7C593.2 409.8 593.2 320.4 593.2 320.4C593.2 320.4 593.2 231 581.8 188.1z'
                />
                <path
                  fill='#ffffff'
                  d='M264.2 401.6V239.2L406.9 320.4L264.2 401.6z'
                />
              </svg>
            </a>
          </div>
          <p className='t-page-subtitle'>
            Uno sguardo alle nostre avventure più recenti.{' '}
          </p>
        </header>

        {/*
          Presentation-only carousel:
          - scrolling, controls, and fades handled client-side
          - data already resolved server-side
        */}
        <VideoCarousel videos={latestVideos} />
      </div>
    </section>
  );
}
