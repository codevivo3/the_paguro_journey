import Link from 'next/link';
// import Image from 'next/image';

// Placeholder data — will be replaced by YouTube API results
const latestVideos = [
  {
    id: 'video-1',
    title: 'Titolo Video Uno',
    description: 'Breve descrizione o estratto.',
    href: '#',
  },
  {
    id: 'video-2',
    title: 'Titolo Video Due',
    description: 'Breve descrizione o estratto.',
    href: '#',
  },
  {
    id: 'video-3',
    title: 'Titolo Video Tre',
    description: 'Breve descrizione o estratto.',
    href: '#',
  },
];

export default function LatestVidsSection() {
  return (
    <section className='py-16 px-6'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section heading */}
        <header className='text-center space-y-3'>
          <h3 className='t-section-title'>
            Ultimi Video
          </h3>
          <p className='t-body'>
            Uno sguardo alle nostre avventure più recenti. (Placeholder cards — will be powered by the YouTube API.)
          </p>
        </header>

        {/* Cards grid */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {latestVideos.map((video) => (
            <article
              key={video.id}
              className='group flex h-full flex-col overflow-hidden rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
            >
              {/* Thumbnail placeholder */}
              <div
                className='aspect-video w-full bg-black/10'
                aria-hidden='true'
              />

              <div className='flex flex-1 flex-col p-6 space-y-3'>
                <h3 className='t-card-title'>
                  {video.title}
                </h3>

                <p className='t-card-body'>
                  {video.description}
                </p>

                <div className='mt-auto pt-4'>
                  <a
                    href={video.href}
                    className='inline-flex items-center gap-2 font-medium transition-colors duration-200 text-sm text-[color:var(--paguro-text)] hover:text-[color:var(--paguro-coral)]'
                  >
                    Guarda su YouTube
                    <span aria-hidden='true'>➜</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}