// Homepage – landing editoriale di The Paguro Journey
// Composta da sezioni riutilizzabili pensate per storytelling, scoperta e chiarezza SEO

// Esperimenti precedenti sul sistema Hero (mantenuti solo come riferimento)
// import Hero from '@/components/Hero';
// import HeroVideo from '@/components/HeroVideo';
// import Navbar from '@/components/Navbar';

import LatestVidsSection from '@/components/sections/LatestVideosSection';
import IntroSection from '@/components/sections/IntroSection';
import HeroSection from '@/components/sections/hero/HeroSection';
import NewsletterForm from '@/components/features/newsletter/NewsletterForm';
import CallToAction from '@/components/sections/CTASection';

import { getHomeHeroSlides } from '@/sanity/queries/homeHeroSlides';
import { mapSanityHeroSlides } from '@/lib/hero-sanity';

// Metadata SEO per la homepage
// Definisce identità del progetto, posizionamento del brand e intento di ricerca
export const metadata = {
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

  console.log('sanitySlides raw:', sanitySlides);
  console.log('slides mapped:', slides);
  console.log('HERO SLIDES', slides);


  return (
    <>
      {/* Area principale dei contenuti editoriali */}
      <main>
        {/* H1 principale (visivamente nascosto) per semantica SEO e accessibilità */}
        <h1 className='sr-only'>The Paguro Journey</h1>
        {/* Sezione Hero: ingresso visivo e posizionamento del brand */}
        <HeroSection slides={slides} overlay />
        {/* Sezione introduttiva: spiega filosofia e visione del progetto */}
        <IntroSection />
        {/* Call to action: accompagna l’utente nel percorso */}
        <CallToAction />
        {/* Partner and collaboration highlights */}
        {/* <CollabsSection /> */}
        {/* Anteprima degli ultimi video per valorizzare lo storytelling multimediale */}
        <LatestVidsSection />
        {/* Iscrizione newsletter: costruzione del pubblico nel lungo periodo */}
        <NewsletterForm />
      </main>
    </>
  );
}
