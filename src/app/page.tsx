import CollabsSection from '@/components/CollabsSection';
import LatestVidsSection from '@/components/LatestVidsSection';
import Hero from '@/components/Hero';
import HeroVideo from '@/components/HeroVideo';
import IntroSection from '@/components/IntroSection';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: {
    default: 'The Paguro Journey',
    template: '%s | The Paguro Journey',
  },
};

export default function Home() {
  return (
    <>
      <main>
        <Hero />
        <HeroVideo />
        <IntroSection />
        <CollabsSection />
        <LatestVidsSection />
      </main>
    </>
  );
}
