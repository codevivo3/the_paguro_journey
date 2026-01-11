import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

import Image from 'next/image';

import { getLatestVideos } from '@/lib/youtube';
import { cleanYouTubeDescription } from '../../lib/cleanYouTubeDescription';

// Placeholder data — will be replaced by YouTube API results
const latestVideos = await getLatestVideos(9);

export default function LatestVidsSection() {
  return (
    <section className='px-6 py-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section heading */}
        <header className='space-y-3'>
          <h3 className='t-page-title'>Ultimi Video</h3>
          <p className='t-page-subtitle'>
            Uno sguardo alle nostre avventure più recenti. (Placeholder — sarà
            alimentato dalla YouTube API.)
          </p>
        </header>

        {/* Cards grid (clean + consistent with the rest of the site) */}
        <div className='columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3'>
          {latestVideos.map((video) => {
            const isShort =
              /#shorts/i.test(video.title) ||
              /#shorts/i.test(video.description) ||
              /shorts/i.test(video.title);

            const mediaClass = isShort ? 'aspect-[9/16]' : 'aspect-video';

            return (
              <div key={video.id} className='break-inside-avoid'>
                <Card>
                  <CardMedia className={mediaClass}>
                    <a
                      href={video.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      aria-label={`Guarda il video: ${video.title}`}
                      className='block relative h-full w-full'
                    >
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
                        className='object-cover transition-transform duration-300 hover:scale-[1.02]'
                        quality={90}
                      />
                    </a>
                  </CardMedia>
                  <CardBody className='flex h-full flex-col'>
                    <CardTitle>{video.title}</CardTitle>
                    <CardText className='clamp-4'>
                      {cleanYouTubeDescription(video.description)}
                    </CardText>
                    <a
                      href={video.href}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 hover:text-[color:var(--paguro-link-hover)]'
                      aria-label={`Guarda il video: ${video.title}`}
                    >
                      Guarda il video <span aria-hidden>➜</span>
                    </a>
                  </CardBody>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
