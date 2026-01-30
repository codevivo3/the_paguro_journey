import Button from '../ui/Button';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

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
  const effectiveLang: Lang = safeLang(lang);

  const content = {
    it: {
      eyebrow: 'Call to action',
      title: 'Lorem ipsum dolor sit amet',
      body:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      cta: 'Scopri il blog',
    },
    en: {
      eyebrow: 'Call to action',
      title: 'Lorem ipsum dolor sit amet',
      body:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
      cta: 'Explore the blog',
    },
  } as const;

  const fallback = content[effectiveLang];

  const resolvedEyebrow = eyebrow ?? fallback.eyebrow;
  const resolvedTitle = title ?? fallback.title;
  const resolvedBody = body ?? fallback.body;
  const resolvedCta = cta ?? fallback.cta;

  return (
    <section className='py-14 px-4 md:py-20 md:px-6 bg-[color:var(--paguro-bg)]'>
      <div className='mx-auto max-w-3xl text-center space-y-5 md:space-y-6'>
        {/* Section eyebrow/label */}
        <p className='t-meta text-[0.7rem] md:text-[0.75rem] [font-family:var(--font-ui)] uppercase tracking-wide'>
          {resolvedEyebrow}
        </p>

        {/* CTA headline */}
        <h2 className='t-section-title text-2xl md:text-3xl title-divider title-divider-center'>
          {resolvedTitle}
        </h2>

        {/* Supporting copy */}
        <p className='t-body text-sm md:text-base'>
          {resolvedBody}
        </p>

        <div className='pt-2'>
          {/* Placeholder action link to be wired later */}
          <Button href={withLangPrefix(effectiveLang, '/blog')} className='text-white'>
            {resolvedCta} <span aria-hidden>➜</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
