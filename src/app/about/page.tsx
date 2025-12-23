import Image from "next/image";

export default function AboutPage() {
  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-3xl space-y-12'>
        {/* Page header */}
        <header className='space-y-4'>
          <h1 className='[font-family:var(--font-ui)] text-6xl font-semibold text-[color:var(--paguro-text-dark)]'>
            About
          </h1>
          <p className='text-[color:var(--paguro-text-dark)]/70'>
            The story behind The Paguro Journey and the values that guide our
            way of traveling.
          </p>
        </header>
        <Image
          src='/about-pic.jpg'
          alt='foto di Valentina e Mattia in un paesaggio naturale'
          aria-label="Prova"
          width={1200}
          height={675}
          className='rounded-2xl'
          aria-hidden='true'
        />

        {/* Content */}
        <section className='prose prose-neutral max-w-none'>
          <p>
            The Paguro Journey was born from a desire to travel slowly,
            consciously, and with respect for places and people. We believe that
            meaningful travel starts with curiosity, patience, and an openness
            to the unexpected.
          </p>

          <p>
            Through videos, stories, and practical guides, we share experiences
            from off-the-beaten-path destinations, highlighting sustainable
            choices and local perspectives.
          </p>

          <p>
            This project is not about collecting places, but about building
            connections — with cultures, environments, and the small moments
            that make each journey unique.
          </p>
        </section>
      </div>
    </main>
  );
}
