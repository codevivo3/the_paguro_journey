import Image from 'next/image';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-3xl space-y-10'>
        {/* Page intro: title + short context */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Chi siamo</h1>
          <p className='t-page-subtitle'>
            La storia dietro The Paguro Journey e i valori che guidano il nostro
            modo di viaggiare.
          </p>
        </header>
        <Image
          src='/about-pic.jpg'
          alt='Foto di Valentina e Mattia in un paesaggio naturale'
          width={1200}
          height={675}
          className='w-full rounded-2xl'
        />

        {/* Editorial content */}
        <section className='prose prose-neutral max-w-none'>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
            malesuada.
          </p>
          <br />
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
          <br />
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>
        </section>

        {/* Call to action */}
        <section className='mt-16 rounded-2xl bg-[color:var(--paguro-ivory)] p-8 text-center'>
          <h2 className='t-section-title'>Continua il viaggio</h2>
          <p className='mt-3 t-body text-[color:var(--paguro-text-dark)]/70'>
            Scopri i racconti, i video e le destinazioni che hanno dato forma a
            questo progetto.
          </p>
          <div className='mt-6'>
            <Link
              href='/blog'
              className='inline-flex items-center gap-2 rounded-full bg-[color:var(--paguro-deep)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[color:var(--paguro-coral)]'
            >
              Vai al blog <span aria-hidden='true'>➜</span>
            </Link>
          </div>
        </section>

        {/* Media Kit Link */}
        <section className='text-center'>
          <p className='t-body text-[color:var(--paguro-text-dark)]/75'>
            Per collaborazioni, stampa e partnership puoi consultare il nostro{' '}
            <Link
              href='/media-kit'
              className='font-semibold transition-colors hover:text-[color:var(--paguro-coral)]'
            >
              Media Kit ➜
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
