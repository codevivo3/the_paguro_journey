import type { Metadata } from 'next';
// Homepage – editorial landing of The Paguro Journey
// Composed of reusable sections designed for storytelling, discovery, and SEO clarity

// Previous experiments with the Hero system (kept for reference only)
// import Hero from '@/components/Hero';
// import HeroVideo from '@/components/HeroVideo';
// import Navbar from '@/components/Navbar';

import LatestVidsSection from '@/components/sections/LatestVideosSection';
import IntroSection from '@/components/sections/IntroSection';
import HeroSection from '@/components/sections/hero/HeroSection';
import NewsletterForm from '@/components/features/newsletter/NewsletterForm';
import CallToAction from '@/components/sections/CTASection';
import BreakImageSection from '@/components/sections/BreakImageSection';

import { getHomeHeroSlides } from '@/sanity/queries/homeHeroSlides';
import { mapSanityHeroSlides } from '@/lib/hero-sanity';
import { getHomeDivider } from '@/sanity/queries/homeDivider';

// SEO metadata for the homepage
// Defines project identity, brand positioning, and search intent
export const metadata: Metadata = {
  title: {
    default: 'The Paguro Journey – Racconti di viaggio, destinazioni e slow travel',
    template: '%s | The Paguro Journey',
  },
  description:
    'The Paguro Journey è un progetto di viaggio dedicato allo slow travel, alle destinazioni autentiche e allo storytelling visivo, per chi viaggia con consapevolezza.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'The Paguro Journey',
    description:
      'Racconti di viaggio, destinazioni e percorsi visivi ispirati allo slow travel e all’esplorazione autentica.',
    type: 'website',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Paguro Journey',
    description:
      'Slow travel, destinazioni autentiche e storytelling visivo dal mondo.',
  },
};
  
  export default async function Home() {
  const sanitySlides = await getHomeHeroSlides();
  const slides = mapSanityHeroSlides(sanitySlides);

  const homeDivider = await getHomeDivider();

  const dividerSrc = homeDivider?.media?.imageUrl;
  const dividerAlt =
    homeDivider?.altOverride?.trim() ||
    homeDivider?.media?.alt?.trim() ||
    'Homepage divider image';


  return (
    <>
      {/* Main editorial content area */}
      <main>
        {/* Main H1 (visually hidden) for SEO semantics and accessibility */}
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* Hero section: visual entry point and brand positioning */}
        <HeroSection slides={slides} overlay />
        {/* Intro section: explains the philosophy and vision of the project */}
        <IntroSection />
        {/* Call to action: guides the user into the journey */}
        <CallToAction />
        {/* Partner and collaboration highlights */}
        {dividerSrc ? (
          <BreakImageSection
            src={dividerSrc}
            alt={dividerAlt}
            caption={homeDivider?.caption ?? undefined}
            href={homeDivider?.link ?? undefined}
            meta={{
              id: homeDivider?.media?._id,
              type: 'mediaItem',
              title: homeDivider?.media?.title,
              credit: homeDivider?.media?.credit,
            }}
          />
        ) : null}
        {/* <CollabsSection /> */}
        {/* Latest videos preview to highlight multimedia storytelling */}
        <LatestVidsSection />
        {/* Newsletter signup: long-term audience building */}
        <NewsletterForm />
      </main>
    </>
  );
}
