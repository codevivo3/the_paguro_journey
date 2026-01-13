import { getLatestRegularVideos } from '@/lib/youtube';
import VideoCarousel from '@/components/features/videos/VideoCarousel.client';

export default async function LatestVidsSection() {
  const latestVideos = await getLatestRegularVideos(15);

  return (
    <section className='px-6 py-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <header className='space-y-3'>
          <h3 className='t-page-title'>Ultimi Video</h3>
          <p className='t-page-subtitle'>
            Uno sguardo alle nostre avventure più recenti. (Placeholder — sarà
            alimentato dalla YouTube API.)
          </p>
        </header>

        <VideoCarousel videos={latestVideos} />
      </div>
    </section>
  );
}
