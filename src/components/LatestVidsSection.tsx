import Link from 'next/link';
import Image from 'next/image';

// Placeholder data — later replace with YouTube Data API results
const latestVideos = [
  {
    id: 'video-1',
    title: 'Video Title One',
    description: 'Short description or excerpt.',
    href: '#',
  },
  {
    id: 'video-2',
    title: 'Video Title Two',
    description: 'Short description or excerpt.',
    href: '#',
  },
  {
    id: 'video-3',
    title: 'Video Title Three',
    description: 'Short description or excerpt.',
    href: '#',
  },
];

export default function LatestVidsSection() {
  return (
    <section className='py-16 px-6'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section heading */}
        <header className='text-center space-y-3'>
          <h3 className='[font-family:var(--font-ui)] text-4xl font-semibold text-[color:var(--paguro-text-dark)]'>
            Latest Videos
          </h3>
          <p className='text-[color:var(--paguro-text-dark)]/70'>
            Uno sguardo alle nostre avventure più recenti. (Placeholder cards —
            will be powered by the YouTube API.)
          </p>
        </header>

        {/* Cards grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {latestVideos.map((video) => (
            <article
              key={video.id}
              className='group overflow-hidden rounded-2xl border border-black/10 bg-[#f5f5f5] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              {/* Thumbnail placeholder */}
              <div
                className='aspect-video w-full bg-black/10'
                aria-hidden='true'
              />

              <div className='p-6 space-y-3'>
                <h3 className='[font-family:var(--font-ui)] text-xl font-semibold text-[color:var(--paguro-text-dark)]'>
                  {video.title}
                </h3>

                <p className='text-[color:var(--paguro-text-dark)]/75 text-sm'>
                  {video.description}
                </p>

                <div>
                  <Link
                    href={video.href}
                    className='inline-flex items-center gap-2 text-[color:var(--paguro-deep)] font-medium transition-colors duration-200 group-hover:text-[color:var(--paguro-coral)] text-sm'
                  >
                    Watch on YouTube
                    <span aria-hidden='true'>➜</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
