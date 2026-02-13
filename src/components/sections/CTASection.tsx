import Button from '../ui/Button';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

// This section supports optional Sanity-resolved copy with language fallback.
type CTASectionProps = {
  lang?: Lang;

  /** Optional Sanity‑resolved copy */
  eyebrow?: string;
  title?: string;
  body?: string;
  cta?: string;
};

export default function CallToAction({
  lang,
  eyebrow,
  title,
  body,
  cta,
}: CTASectionProps) {
  // Use safeLang to guarantee a valid locale even if input is undefined or invalid.
  const effectiveLang: Lang = safeLang(lang);

  // Local fallback copy (IT/EN) used when Sanity fields are missing.
  const content = {
    it: {
      eyebrow: 'Call to action',
      title: 'Call to action IT TEST AUTO DEPLOY',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      cta: 'Scopri il blog',
    },
    en: {
      eyebrow: 'Call to action',
      title: 'Call to action EN TEST AUTO DEPLOY',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      cta: 'Explore the blog',
    },
  } as const;

  const fallback = content[effectiveLang];

  // Resolve each piece of content by preferring Sanity data, falling back to local copy.
  const resolvedEyebrow = eyebrow ?? fallback.eyebrow;
  const resolvedTitle = title ?? fallback.title;
  const resolvedBody = body ?? fallback.body;
  const resolvedCta = cta ?? fallback.cta;

  return (
    // Generic, reusable CTA block with padding and background color.
    <section className='py-14 px-4 md:py-20 md:px-6 bg-[color:var(--paguro-bg)]'>
      <div className='mx-auto max-w-3xl text-center space-y-5 md:space-y-6'>
        {/* Section eyebrow/label */}
        {/* <p className='t-meta text-[0.7rem] md:text-[0.75rem] [font-family:var(--font-ui)] uppercase tracking-wide'>
          {resolvedEyebrow}
        </p> */}

        {/* CTA headline */}
        <h2 className='t-section-title text-2xl md:text-3xl title-divider title-divider-center'>
          {resolvedTitle}
        </h2>

        {/* Supporting copy */}
        <p className='t-body text-sm md:text-base'>
          {resolvedBody}
        </p>

        <div className='pt-2'>
          {/* Uses shared Button component and withLangPrefix to ensure locale-aware routing */}
          <Button
            href={withLangPrefix(effectiveLang, '/blog')}
            className='text-white flex max-w-2xl justify-center'
          >
            {/* Layout choice: icon + text aligned horizontally with spacing.
                Accessibility: arrow is decorative and hidden from screen readers. */}
            <div className='flex items-center gap-3 text-center'>
              <span>{resolvedCta}</span>
              <span aria-hidden>➜</span>
            </div>
          </Button>
        </div>
      </div>
    </section>
  );
}
