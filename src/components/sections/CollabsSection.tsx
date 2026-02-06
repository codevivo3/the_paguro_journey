import Link from 'next/link';
import Button from '../ui/Button';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

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
  const effectiveLang: Lang = safeLang(lang);

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
        <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button className='min-w-[200px]'>
            <a
              href='/media-kit/mediakit.pdf'
              target="_blank"
              rel="noopener noreferrer"
              className='flex w-full items-center justify-around px-4 text-center'
            >
              <span>{resolvedCtaMediaKit}</span>
              <span aria-hidden className='ml-3'>➜</span>
            </a>
          </Button>

          <Button className='min-w-[200px] bg-white'>
            <Link
              href={withLangPrefix(effectiveLang, '/contact')}
              className="
                flex w-full items-center justify-around px-4
                text-center
                text-[color:var(--paguro-ocean)]
                transition-colors duration-200
                group-hover:text-white
              "
            >
              <span>{resolvedCtaContact}</span>
              <span aria-hidden className="ml-3">➜</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
