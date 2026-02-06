import Link from 'next/link';
import Button from '../ui/Button';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

// Defines the props for the CollabsSection component, including optional Sanity-resolved copy and language handling.
type CollabsSectionProps = {
  lang?: Lang;

  /** Optional Sanity-resolved copy */
  title?: string;
  body?: string;
  ctaMediaKit?: string;
  ctaContact?: string;
};

export default function CollabsSection({
  lang,
  title,
  body,
  ctaMediaKit,
  ctaContact,
}: CollabsSectionProps) {
  // Use safeLang to ensure a valid language code is always used, falling back if necessary.
  const effectiveLang: Lang = safeLang(lang);

  // Local fallback copy for Italian and English, used if no props are provided.
  const content = {
    it: {
      title: 'Collabora con noi',
      body:
        'Raccontiamo il viaggio in modo autentico, lento e consapevole. Siamo aperti a collaborazioni editoriali, creative e culturali in linea con il nostro modo di esplorare il mondo.',
      ctaMediaKit: 'Scarica Media Kit',
      ctaContact: 'Contattaci',
    },
    en: {
      title: 'Collaborate with us',
      body:
        'We tell travel stories in an authentic, slow, and mindful way. We are open to editorial, creative, and cultural collaborations aligned with our way of exploring the world.',
      ctaMediaKit: 'Download Media Kit',
      ctaContact: 'Get in touch',
    },
  } as const;

  const fallback = content[effectiveLang];

  const resolvedTitle = title ?? fallback.title;
  const resolvedBody = body ?? fallback.body;
  const resolvedCtaMediaKit = ctaMediaKit ?? fallback.ctaMediaKit;
  const resolvedCtaContact = ctaContact ?? fallback.ctaContact;

  return (
    <section className='px-6 pb-24 pt-16'>
      <div className='mx-auto max-w-5xl space-y-8'>
        {/* Section header */}
        <header className='mx-auto max-w-2xl space-y-3 text-center'>
          <h2 className='t-section-title text-3xl title-divider title-divider-center'>{resolvedTitle}</h2>
          <p className='t-body'>
            {resolvedBody}
          </p>
        </header>

        {/* CTAs */}
        {/* 
          The CTA section uses two Buttons:
          - One wraps an anchor linking to the media kit PDF (external link).
          - The other wraps a Next.js Link to the contact page.
          Note: Nesting links inside Button components works visually but is not semantically ideal.
          Future refactor should leverage Button's href and external props to improve semantics.
        */}
        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button className='w-10/12 sm:w-[260px]'>
            <a
              href='/media-kit/mediakit.pdf'
              target="_blank"
              rel="noopener noreferrer"
              className='flex w-full items-center justify-center gap-3 px-6 text-center'
            >
              <span>{resolvedCtaMediaKit}</span>
              <span aria-hidden>➜</span>
            </a>
          </Button>

          <Button className='w-10/12 sm:w-[260px] bg-white'>
            <Link
              href={withLangPrefix(effectiveLang, '/contact')}
              className="
                flex w-full items-center justify-center gap-3 px-6
                text-center
                text-[color:var(--paguro-ocean)]
                transition-colors duration-200
                group-hover:text-white
              "
            >
              <span>{resolvedCtaContact}</span>
              <span aria-hidden>➜</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
