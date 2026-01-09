import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

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
    <section className='px-6 py-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section heading */}
        <header className='space-y-3'>
          <h3 className='t-section-title'>Ultimi Video</h3>
          <p className='t-body'>
            Uno sguardo alle nostre avventure più recenti. (Placeholder — sarà
            alimentato dalla YouTube API.)
          </p>
        </header>

        {/* Cards grid (clean + consistent with the rest of the site) */}
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {latestVideos.map((video) => (
            <Card
              key={video.id}
              href={video.href}
              external
              ariaLabel={`Guarda il video: ${video.title}`}
            >
              <CardMedia className='aspect-video'>
                {/* Thumbnail placeholder (later: YouTube thumbnail) */}
                <div aria-hidden='true' className='h-full w-full bg-black/10' />
              </CardMedia>

              <CardBody>
                <CardTitle>{video.title}</CardTitle>
                <CardText>{video.description}</CardText>

                {/*
                  NOTE: Card is already fully clickable (overlay link).
                  Keep this as plain text to avoid nested links.
                */}
                <div className='mt-auto pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]'>
                  Guarda il video <span aria-hidden>➜</span>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
