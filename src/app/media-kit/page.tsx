import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Media Kit',
  description: 'Scarica il media kit ufficiale di The Paguro Journey.',
};

export default function MediaKitPage() {
  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page header */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Media Kit</h1>
          <p className='t-page-subtitle'>
            Materiali ufficiali per stampa, brand e collaborazioni: bio, loghi,
            foto e contatti.
          </p>
        </header>

        {/* Download card */}
        <section className='rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-6 sm:p-8 shadow-sm'>
          <div className='space-y-3'>
            <h2 className='t-section-title'>Download Media Kit (PDF)</h2>
            <p className='t-body'>
              Versione aggiornata pronta per essere condivisa con brand e
              partner.
            </p>

            <div className='pt-2 flex flex-wrap gap-3'>
              <Button href='/media-kit/paguro-media-kit.pdf'>
                Scarica PDF ➜
              </Button>

              <Button
                href='/contact'
                className='bg-[color:var(--paguro-sand)] text-[color:var(--paguro-text)]'
              >
                Contattaci ➜
              </Button>
            </div>
          </div>
        </section>

        {/* Optional: what's inside */}
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
