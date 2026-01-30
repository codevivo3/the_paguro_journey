import { safeLang, type Lang } from '@/lib/route';
import Button from '../../ui/Button';


type NewsletterFormProps = {
  lang?: Lang;

  /** Optional Sanity-resolved copy overrides */
  aria?: string;
  title?: string;
  subtitle1?: string;
  subtitle2?: string;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  cta?: string;
  privacy?: string;
};

export default function NewsletterForm({
  lang,
  aria,
  title,
  subtitle1,
  subtitle2,
  nameLabel,
  namePlaceholder,
  emailLabel,
  emailPlaceholder,
  cta,
  privacy,
}: NewsletterFormProps) {
  const effectiveLang: Lang = safeLang(lang);
  const copy = {
    it: {
      aria: 'Newsletter',
      title: 'Ricevi nuovi racconti di viaggio',
      subtitle1: 'Una mail ogni tanto. Storie dal mondo, video e aggiornamenti.',
      subtitle2: 'Niente spam.',
      nameLabel: 'Il tuo nome',
      namePlaceholder: 'Il tuo nome (opzionale)',
      emailLabel: 'Indirizzo email',
      emailPlaceholder: 'La tua email',
      cta: 'Iscriviti',
      privacy: 'Nessuna pubblicità. Potrai disiscriverti in qualsiasi momento.',
    },
    en: {
      aria: 'Newsletter',
      title: 'Get new travel stories',
      subtitle1: 'An occasional email. Stories from around the world, videos, and updates.',
      subtitle2: 'No spam.',
      nameLabel: 'Your name',
      namePlaceholder: 'Your name (optional)',
      emailLabel: 'Email address',
      emailPlaceholder: 'Your email',
      cta: 'Subscribe',
      privacy: 'No advertising. You can unsubscribe at any time.',
    },
  } as const;

  const fallback = copy[effectiveLang];
  const t = {
    aria: aria ?? fallback.aria,
    title: title ?? fallback.title,
    subtitle1: subtitle1 ?? fallback.subtitle1,
    subtitle2: subtitle2 ?? fallback.subtitle2,
    nameLabel: nameLabel ?? fallback.nameLabel,
    namePlaceholder: namePlaceholder ?? fallback.namePlaceholder,
    emailLabel: emailLabel ?? fallback.emailLabel,
    emailPlaceholder: emailPlaceholder ?? fallback.emailPlaceholder,
    cta: cta ?? fallback.cta,
    privacy: privacy ?? fallback.privacy,
  } as const;

  return (
    <div className='mx-auto my-10 md:my-16 max-w-xl px-4 md:px-0'>
      <section
        aria-label={t.aria}
        className='rounded-sm border border-black/10 bg-[color:var(--paguro-surface)] p-4 md:p-6'
      >
        <h2 className='[font-family:var(--font-ui)] text-xl md:text-2xl font-semibold text-[color:var(--paguro-text-dark)] text-center'>
          {t.title}
        </h2>
        <p className='mt-2 text-sm md:text-base text-center text-[color:var(--paguro-text-dark)]/80'>
          {t.subtitle1}
          <br className='hidden sm:block' />
          {t.subtitle2}
        </p>

        <form className='mt-6 flex flex-col gap-4'>
          <label className='sr-only' htmlFor='name'>
            {t.nameLabel}
          </label>
          <input
            id='name'
            type='text'
            autoComplete='given-name'
            placeholder={t.namePlaceholder}
            className='h-10 w-full rounded-full border border-black/10 bg-white px-4 text-base text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
          />

          <label className='sr-only' htmlFor='email'>
            {t.emailLabel}
          </label>
          <div className='flex flex-col gap-4 md:gap-0 md:flex-row md:items-center md:justify-between'>
            <input
              id='email'
              type='email'
              inputMode='email'
              autoComplete='email'
              placeholder={t.emailPlaceholder}
              className='h-10 w-full md:flex-1 md:max-w-none rounded-full border border-black/10 bg-white px-4 text-base text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
            />

            <div className='flex justify-center md:justify-end md:ml-4'>
              <Button className='px-10'>{t.cta}</Button>
            </div>
          </div>
        </form>

        <p className='mt-4 text-center text-[0.65rem] md:text-xs text-[color:var(--paguro-text-dark)]/60'>
          {t.privacy}
        </p>
      </section>
    </div>
  );
}
