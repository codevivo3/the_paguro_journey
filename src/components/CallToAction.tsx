import Link from 'next/link';

// Temporary homepage CTA placeholder component
export default function CallToAction() {
  return (
    <section className='py-20 px-6'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        {/* Section eyebrow/label */}
        <p className='[font-family:var(--font-ui)] text-sm uppercase tracking-wide text-[color:var(--paguro-text-dark)]/60'>
          Call to action
        </p>

        {/* CTA headline */}
        <h2 className='[font-family:var(--font-ui)] text-3xl font-semibold text-[color:var(--paguro-text-dark)]'>
          Lorem ipsum dolor sit amet
        </h2>

        {/* Supporting copy */}
        <p className='text-[color:var(--paguro-text-dark)]/75'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore.
        </p>

        <div>
          {/* Placeholder action link to be wired later */}
          <Link
            href='#'
            className='inline-flex items-center gap-2 rounded-full bg-[color:var(--paguro-deep)] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[color:var(--paguro-coral)]'
          >
            Placeholder CTA <span aria-hidden>➜</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
