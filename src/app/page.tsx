// Homepage layout composed of reusable sections

// Previous hero experiments kept for reference:
// import Hero from '@/components/Hero';
// import HeroVideo from '@/components/HeroVideo';
// import Navbar from '@/components/Navbar';

import CollabsSection from '@/components/CollabsSection';
import LatestVidsSection from '@/components/LatestVidsSection';
import IntroSection from '@/components/IntroSection';
import HeroSlideShow from '@/components/HeroSlideShow';
import NewsletterForm from '@/components/NewsletterForm';
import CallToAction from '@/components/CallToAction';

// SEO metadata for the homepage
export const metadata = {
  title: {
    default: 'The Paguro Journey',
    template: '%s | The Paguro Journey',
  },
};

export default function Home() {
  return (
    <>
      {/* Main content area for the homepage */}
      <main>
        {/* Visually hidden h1 for SEO and accessibility */}
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* Primary visual hero section */}
        <HeroSlideShow />
        {/* Introductory content explaining the project */}
        <IntroSection />
        {/* Primary call-to-action (temporary placeholder) */}
        <CallToAction />
        {/* Partner and collaboration highlights */}
        <CollabsSection />
        {/* Latest video content preview */}
        <LatestVidsSection />
        {/* Newsletter signup to capture early interest */}
        <NewsletterForm />
      </main>
    </>
  );
}
