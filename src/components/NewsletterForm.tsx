export default function NewsletterForm() {
  return (
    <div className='mx-auto my-10 pb-10 max-w-3xl'>
      <section
        aria-label='Newsletter'
        className='rounded-2xl border border-black/10 bg-white/60 p-6'
      >
        <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
          Newsletter
        </h2>
        <p className='mt-2 text-[color:var(--paguro-text-dark)]/75'>
          Want occasional updates (no spam, no clickbait)? Leave your email and
          we’ll wire this to the newsletter tool later.
        </p>
        <form className='mt-5 flex flex-col gap-3 sm:flex-row'>
          <label className='sr-only' htmlFor='email'>
            Email address
          </label>
          <input
            id='email'
            type='email'
            inputMode='email'
            autoComplete='email'
            placeholder='you@example.com'
            className='h-11 w-full flex-1 rounded-xl border border-black/10 bg-white px-4 text-[color:var(--paguro-text-dark)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          />
          <button
            type='button'
            className='h-11 rounded-xl bg-[color:var(--paguro-deep)] px-5 [font-family:var(--font-ui)] font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[color:var(--paguro-coral)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          >
            Subscribe
          </button>
        </form>
        <p className='mt-3 text-xs text-[color:var(--paguro-text-dark)]/60'>
          Note: this form is UI-only for now. Later we’ll connect it to Kit /
          Beehiiv (or whichever tool you choose).
        </p>
      </section>
    </div>
  );
}
