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
import { getHomeHeroSlides } from '@/sanity/queries/homeHeroSlides';
import { getHomeDivider } from '@/sanity/queries/homeDivider';
import { mapSanityHeroSlides } from '@/lib/hero-sanity';

import { safeLang, type Lang } from '@/lib/route';

function withLangPrefix(path: string, lang: Lang) {
  const clean = path.startsWith('/') ? path : `/${path}`;

  // Home canonical should be `/it` or `/en` (not `/it/`).
  if (clean === '/') return `/${lang}`;

  // Avoid double-prefixing.
  if (clean.startsWith('/it') || clean.startsWith('/en')) return clean;

  return `/${lang}${clean}`;
}

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
      titleDefault: 'The Paguro Journey – Travel stories, destinations & slow travel',
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
  const canonical = withLangPrefix('/', effectiveLang);

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

export async function renderHome(lang: Lang) {
  const { desktop } = await getHomeHeroSlides(lang);

  // Server-rendered homepage uses desktop hero by default.
  // Mobile variant can be swapped client-side later if needed.
  const slides = mapSanityHeroSlides(desktop, lang);

  const homeDivider = await getHomeDivider(lang);

  const dividerSrc = homeDivider?.media?.imageUrl;
  const dividerAlt =
    homeDivider?.altOverride?.trim() ||
    homeDivider?.media?.alt?.trim() ||
    (lang === 'en' ? 'Homepage divider image' : 'Immagine divisore homepage');

  return (
    <>
      {/* Main editorial content area */}
      <main>
        {/* Main H1 (visually hidden) for SEO semantics and accessibility */}
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* Hero section: visual entry point and brand positioning */}
        <HeroSection lang={lang} slides={slides} overlay />

        {/* Intro section: explains the philosophy and vision of the project */}
        <IntroSection lang={lang} />

        {/* Latest videos preview: highlight video storytelling early */}
        <LatestVidsSection lang={lang} />

        {/* Break image: visual pause to reset rhythm before the CTA */}
        {dividerSrc ? (
          <BreakImageSection
            src={dividerSrc}
            alt={dividerAlt}
            caption={homeDivider?.media?.captionResolved ?? homeDivider?.caption ?? undefined}
            href={homeDivider?.link ?? undefined}
            meta={{
              id: homeDivider?.media?._id,
              type: 'mediaItem',
              title: homeDivider?.media?.title,
              credit: homeDivider?.media?.credit,
            }}
          />
        ) : null}

        {/* Call to action: invite the user to continue the journey */}
        <CallToAction lang={lang} />

        {/* Collaborations: media kit / contact entry point (to be enabled) */}
        <CollabsSection lang={lang} />

        {/* Newsletter signup: long-term audience building */}
        <NewsletterForm lang={lang} />
      </main>
    </>
  );
}

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);
  return renderHome(effectiveLang);
}
