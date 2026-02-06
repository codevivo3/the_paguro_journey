/****
 * LatestVideosSection
 *
 * Displays the most recent YouTube videos using a horizontal carousel.
 * Includes a direct link to the Paguro Journey YouTube channel.
 */
import { getLatestRegularVideos } from '@/lib/youtube/youtube';
import VideoCarousel from '@/components/features/videos/VideoCarousel.client';
import { safeLang, type Lang } from '@/lib/route';

type LatestVidsSectionProps = {
  lang?: Lang;
  /** Optional overrides (Sanity-wired). If provided, they take priority over fallback copy. */
  title?: string;
  subtitle?: string;
};

export default async function LatestVidsSection({
  lang,
  title,
  subtitle,
}: LatestVidsSectionProps) {
  const effectiveLang: Lang = safeLang(lang);

  // Server-side fetch: keeps API keys and quota logic out of the client bundle
  const latestVideos = await getLatestRegularVideos(15, { lang: effectiveLang });

  const copy = {
    it: {
      title: 'Viaggi raccontati in video',
      subtitle:
        'Slow travel, destinazioni autentiche e storie vissute sul campo, raccontate attraverso il video.',
    },
    en: {
      title: 'Journeys told through video',
      subtitle:
        'Slow travel, authentic destinations, and real stories from the road, told through video.',
    },
  } as const;

  const fallback = copy[effectiveLang];
  const t = {
    title: title ?? fallback.title,
    subtitle: subtitle ?? fallback.subtitle,
  };

  return (
    <section className='px-4 py-10 md:px-6 md:py-16'>
      <div className='mx-auto max-w-5xl space-y-6 md:space-y-8'>
        <header className='space-y-2 md:space-y-3'>
          <div className='flex flex-col items-center justify-center gap-3'>
            <h3 className='t-page-title title-divider title-divider-center'>
              {t.title}
            </h3>
          </div>
          <p className='t-page-subtitle text-sm md:text-base'>{t.subtitle}</p>
        </header>

        {/*
          Presentation-only carousel:
          - scrolling, controls, and fades handled client-side
          - data already resolved server-side
        */}
        <VideoCarousel lang={effectiveLang} videos={latestVideos} />
      </div>
    </section>
  );
}
