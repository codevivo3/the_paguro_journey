import Button from '../ui/Button';

// Temporary homepage CTA placeholder component
export default function CallToAction() {
  return (
    <section className='py-20 px-6 bg-[color:var(--paguro-bg)]'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        {/* Section eyebrow/label */}
        <p className='t-meta [font-family:var(--font-ui)] uppercase tracking-wide'>
          Call to action
        </p>

        {/* CTA headline */}
        <h2 className='t-section-title text-3xl'>Lorem ipsum dolor sit amet</h2>

        {/* Supporting copy */}
        <p className='t-body'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore.
        </p>

        <div>
          {/* Placeholder action link to be wired later */}
          <Button href='/blog' className='text-white'>
            Placeholder CTA <span aria-hidden>➜</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
