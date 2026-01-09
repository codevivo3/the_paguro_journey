import Button from '../../ui/Button';

export default function NewsletterForm() {
  return (
    <div className='mx-auto my-10 pb-10 max-w-3xl'>
      <section
        aria-label='Newsletter'
        className='rounded-sm border border-black/10 bg-[color:var(--paguro-surface)] p-6'
      >
        <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
          Newsletter
        </h2>
        <p className='mt-2 t-body'>
          Iscriviti alla newsletter per ricevere nuovi racconti di viaggio,
          video e aggiornamenti — senza spam.
        </p>
        <form className='mt-5 flex flex-col gap-3 sm:flex-row'>
          <label className='sr-only' htmlFor='email'>
            Indirizzo email
          </label>
          <input
            id='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            placeholder='you@example.com'
            className='h-11 w-full flex-1 rounded-full border border-black/10 bg-white px-4 text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          />
          <Button className='h-11'>Iscriviti</Button>
        </form>
        <p className='mt-3 text-xs text-[color:var(--paguro-text-dark)]/60'>
          Note: this form is UI-only for now. Later we’ll connect it to Kit /
          Beehiiv (or whichever tool you choose).
        </p>
      </section>
    </div>
  );
}
