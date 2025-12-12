import Hero from "@/components/Hero";
import HeroVideo from "@/components/HeroVideo";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        <Hero />
        <HeroVideo />
      </main>
    </>
  );
}
