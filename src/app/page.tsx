import CollabsSection from '@/components/CollabsSection';
import LatestVidsSection from '@/components/LatestVidsSection';
// import Hero from '@/components/Hero';
// import HeroVideo from '@/components/HeroVideo';
import IntroSection from '@/components/IntroSection';
// import Navbar from '@/components/Navbar';
import HeroSlideShow from '@/components/HeroSlideShow';

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
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* <Hero /> */}
        <HeroSlideShow />
        <IntroSection />
        <CollabsSection />
        <LatestVidsSection />
      </main>
    </>
  );
}
