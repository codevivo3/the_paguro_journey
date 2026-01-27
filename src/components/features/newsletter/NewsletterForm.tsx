import Button from '../../ui/Button';

export default function NewsletterForm() {
  return (
    <div className='mx-auto my-10 md:my-16 max-w-2xl px-4 md:px-0'>
      <section
        aria-label='Newsletter'
        className='rounded-sm border border-black/10 bg-[color:var(--paguro-surface)] p-4 md:p-6'
      >
        <h2 className='[font-family:var(--font-ui)] text-xl md:text-2xl font-semibold text-[color:var(--paguro-text-dark)] text-center'>
          Ricevi nuovi racconti di viaggio
        </h2>
        <p className='mt-2 text-sm md:text-base text-center text-[color:var(--paguro-text-dark)]/80'>
          Una mail ogni tanto. Storie dal mondo, video e aggiornamenti.
          <br className='hidden sm:block' />
          Niente spam.
        </p>

        <form className='mt-6 flex flex-col gap-4'>
          <label className='sr-only' htmlFor='name'>
            Il tuo nome
          </label>
          <input
            id='name'
            type='text'
            autoComplete='given-name'
            placeholder='Il tuo nome (opzionale)'
            className='h-12 w-full rounded-full border border-black/10 bg-white px-4 text-base text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          />

          <label className='sr-only' htmlFor='email'>
            Indirizzo email
          </label>
          <input
            id='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            placeholder='La tua email'
            className='h-12 w-full rounded-full border border-black/10 bg-white px-4 text-base text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          />

          <div className='flex justify-center pt-1'>
            <Button>
              Iscriviti
            </Button>
          </div>
        </form>

        <p className='mt-4 text-center text-[0.65rem] md:text-xs text-[color:var(--paguro-text-dark)]/60'>
          Nessuna pubblicità. Potrai disiscriverti in qualsiasi momento.
        </p>
      </section>
    </div>
  );
}
