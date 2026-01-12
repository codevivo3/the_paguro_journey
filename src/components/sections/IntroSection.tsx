import Divider from '@/components/ui/Divider';

export default function IntroSection() {
  return (
    <section className=''>
      <div className='h-20 bg-gradient-to-b from-[color:var(--paguro-deep)]/30 to-transparent' />
      <div className='relative z-10 mx-auto max-w-5xl space-y-4 px-6 py-6'>
        {/* Section title (uses global typography preset) */}
        <h2 className='t-page-title-intro text-6xl text-center py-2'>
          Racconti di Viaggio
        </h2>

        {/* Intro copy (uses global typography preset) */}
        <p className='t-body'>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptate
          quis quam facilis reiciendis impedit debitis eos deleniti vero at
          maxime. Dolorem numquam pariatur ullam ipsum corrupti illum. Illum
          harum, blanditiis commodi dicta quos totam facilis, ex quod laborum
          corporis at. Repudiandae dolore, facilis distinctio architecto ex
          optio deserunt nesciunt nostrum ut doloribus veritatis porro maxime ab
          quisquam nam, officia expedita! Necessitatibus, minima molestiae
          explicabo voluptates odit cupiditate, velit dignissimos saepe qui nisi
          veniam, reprehenderit maxime? Distinctio architecto hic vel cumque.
          Aliquid necessitatibus nihil ullam eos fuga enim velit cupiditate
          voluptatem neque ipsam consequuntur repellat cumque doloribus minima,
          accusantium ex voluptate!
        </p>
      </div>
    </section>
  );
}
