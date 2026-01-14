import type { Metadata } from 'next';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: {
    default: 'Media Kit | The Paguro Journey',
    template: '%s | The Paguro Journey',
  },
  description:
    'Scarica il media kit ufficiale di The Paguro Journey: bio, loghi, foto e contatti per stampa e collaborazioni.',
  alternates: {
    canonical: '/media-kit',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'it_IT',
    title: 'Media Kit | The Paguro Journey',
    description:
      'Materiali ufficiali per stampa, brand e collaborazioni: bio, loghi, foto e contatti. Scarica il PDF.',
    url: '/media-kit',
    images: [
      {
        url: '/destinations/images/cover/copertina-the-paguro-journey-1.jpg',
        width: 1200,
        height: 630,
        alt: 'The Paguro Journey — Media Kit',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Media Kit | The Paguro Journey',
    description:
      'Scarica il media kit ufficiale: bio, loghi, foto e contatti per collaborazioni.',
    images: ['/destinations/images/cover/copertina-the-paguro-journey-1.jpg'],
  },
};

export default function MediaKitPage() {
  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page intent: quick access to downloadable press assets */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Media Kit</h1>
          <p className='t-page-subtitle'>
            Materiali ufficiali per stampa, brand e collaborazioni: bio, loghi,
            foto e contatti.
          </p>
        </header>

        {/* Primary CTA: downloadable PDF for press/partners */}
        <section className='rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 sm:p-8 shadow-sm'>
          <div className='space-y-3'>
            <h2 className='t-section-title'>Scarica il Media Kit (PDF)</h2>
            <p className='t-body'>
              Versione aggiornata pronta per stampa, brand e partner.
            </p>

            <div className='pt-2 flex flex-wrap gap-3'>
              <Button
                href='/media-kit/paguro-media-kit.pdf'
                className='bg-[color:var(--paguro-deep)] text-white'
              >
                Scarica PDF ➜
              </Button>

              <Button
                href='/contact'
                className='bg-white text-[color:var(--paguro-deep)] hover:text-white'
              >
                Contattaci ➜
              </Button>
            </div>
          </div>
        </section>

        {/* Secondary content: clarifies what the media kit includes */}
        <section className='grid gap-4 md:grid-cols-3'>
          {[
            {
              title: 'Bio & Story',
              text: 'Chi siamo, missione e tono editoriale.',
            },
            {
              title: 'Loghi & Brand',
              text: 'Loghi, colori e linee guida essenziali.',
            },
            {
              title: 'Foto & Contatti',
              text: 'Immagini selezionate e contatti rapidi.',
            },
          ].map((item) => (
            <div
              key={item.title}
              className='rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 shadow-sm'
            >
              <h3 className='t-card-title'>{item.title}</h3>
              <p className='t-body'>{item.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
