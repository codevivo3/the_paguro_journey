import type { Metadata } from 'next';

// Sections (page flow order)
import HeroSection from '@/components/sections/hero/HeroSection';
import IntroSection from '@/components/sections/IntroSection';
import LatestVidsSection from '@/components/sections/LatestVideosSection';
import BreakImageSection from '@/components/sections/BreakImageSection';
import CallToAction from '@/components/sections/CTASection';
import CollabsSection from '@/components/sections/CollabsSection';

// Features
import NewsletterForm from '@/components/features/newsletter/NewsletterForm';

// Sanity / data
import { getHomePageData } from '@/sanity/queries/home';
import { getHomeIntro } from '@/sanity/queries/homeIntro';

import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const meta = {
    it: {
      titleDefault:
        'The Paguro Journey – Racconti di viaggio, destinazioni e slow travel',
      description:
        'The Paguro Journey è un progetto di viaggio dedicato allo slow travel, alle destinazioni autentiche e allo storytelling visivo, per chi viaggia con consapevolezza.',
      ogDescription:
        'Racconti di viaggio, destinazioni e percorsi visivi ispirati allo slow travel e all’esplorazione autentica.',
      twitterDescription:
        'Slow travel, destinazioni autentiche e storytelling visivo dal mondo.',
      locale: 'it_IT',
    },
    en: {
      titleDefault:
        'The Paguro Journey – Travel stories, destinations & slow travel',
      description:
        'The Paguro Journey is a travel project focused on slow travel, authentic destinations, and visual storytelling for mindful travelers.',
      ogDescription:
        'Travel stories, destinations, and visual paths inspired by slow travel and authentic exploration.',
      twitterDescription:
        'Slow travel, authentic destinations, and visual storytelling from around the world.',
      locale: 'en_US',
    },
  } as const;

  const m = meta[effectiveLang];
  const canonical = withLangPrefix(effectiveLang, '/');

  return {
    title: {
      default: m.titleDefault,
      template: '%s | The Paguro Journey',
    },
    description: m.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'The Paguro Journey',
      description: m.ogDescription,
      type: 'website',
      url: canonical,
      locale: m.locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: 'The Paguro Journey',
      description: m.twitterDescription,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const [data, intro] = await Promise.all([
    getHomePageData(effectiveLang),
    getHomeIntro(effectiveLang),
  ]);

  return (
    <>
      {/* Main editorial content area */}
      <main>
        {/* Main H1 (visually hidden) for SEO semantics and accessibility */}
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* Hero section: visual entry point and brand positioning */}
        <HeroSection
          lang={effectiveLang}
          slidesDesktop={data.hero.slidesDesktop}
          slidesMobile={data.hero.slidesMobile}
          overlay
        />

        {/* Intro section: explains the philosophy and vision of the project */}
        <IntroSection lang={effectiveLang} data={intro} />

        {/* Latest videos preview: highlight video storytelling early */}
        <LatestVidsSection lang={effectiveLang} />

        {/* Break image: visual pause to reset rhythm before the CTA */}
        {data.breakImageProps ? <BreakImageSection {...data.breakImageProps} /> : null}

        {/* Call to action: invite the user to continue the journey */}
        <CallToAction lang={effectiveLang} />

        {/* Collaborations: media kit / contact entry point (to be enabled) */}
        <CollabsSection lang={effectiveLang} />

        {/* Newsletter signup: long-term audience building */}
        <NewsletterForm lang={effectiveLang} />
      </main>
    </>
  );
}
