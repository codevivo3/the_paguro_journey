'use client';

import * as React from 'react';
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

function validateEmail(input: string): { ok: boolean; reason?: string } {
  const email = input.trim();

  if (!email) return { ok: false, reason: 'empty' };
  if (email.includes(' ')) return { ok: false, reason: 'spaces' };

  const at = email.indexOf('@');
  if (at <= 0) return { ok: false, reason: 'missing_at' };
  if (email.indexOf('@', at + 1) !== -1) return { ok: false, reason: 'multiple_at' };

  const local = email.slice(0, at);
  const domain = email.slice(at + 1);

  if (local.length < 1 || local.length > 64) return { ok: false, reason: 'local_len' };
  if (domain.length < 1 || domain.length > 255) return { ok: false, reason: 'domain_len' };

  if (local.startsWith('.') || local.endsWith('.')) return { ok: false, reason: 'local_dot' };
  if (domain.startsWith('.') || domain.endsWith('.')) return { ok: false, reason: 'domain_dot' };
  if (email.includes('..')) return { ok: false, reason: 'double_dot' };

  if (!domain.includes('.')) return { ok: false, reason: 'no_dot' };

  const labels = domain.toLowerCase().split('.');
  // Basic TLD sanity: 2..24 chars
  const tld = labels[labels.length - 1] ?? '';
  if (tld.length < 2 || tld.length > 24) return { ok: false, reason: 'tld' };

  for (const label of labels) {
    if (!label) return { ok: false, reason: 'empty_label' };
    if (label.length > 63) return { ok: false, reason: 'label_len' };
    if (label.startsWith('-') || label.endsWith('-')) return { ok: false, reason: 'label_dash' };
    if (!/^[a-z0-9-]+$/.test(label)) return { ok: false, reason: 'label_chars' };
  }

  return { ok: true };
}

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

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const newsletterActive = false; // toggle to true when backend is wired
  const buttonLabel = newsletterActive
    ? t.cta
    : effectiveLang === 'en'
      ? 'Coming soon'
      : 'Prossimamente';

  const emailErrorMessage =
    emailError
      ? effectiveLang === 'en'
        ? 'Enter a valid email (e.g. name@domain.com)'
        : 'Inserisci un’email valida (es. nome@dominio.com)'
      : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newsletterActive) return;

    const res = validateEmail(email);
    if (!res.ok) {
      setEmailError(res.reason ?? 'invalid');
      return;
    }

    setEmailError(null);

    // TODO: wire provider here (Mailchimp / Beehiiv / ConvertKit)
  }

  return (
    <div className='mx-auto my-10 md:my-16 max-w-xl px-4 md:px-0'>
      <section
        aria-label={t.aria}
        className='rounded-sm border border-black/10 bg-[color:var(--paguro-surface)] p-4 md:p-6'
      >
        <h2 className='[font-family:var(--font-ui)] text-xl md:text-2xl font-semibold text-[color:var(--paguro-text-dark)] text-center'>
          {t.title}
        </h2>
        <p className='t-card-body text-center'>
          {t.subtitle1}
          <br className='hidden sm:block' />
          {t.subtitle2}
        </p>

        {!newsletterActive && (
          <p className='mt-4 text-sm text-center text-[color:var(--paguro-text-dark)]/70 italic'>
            {effectiveLang === 'en'
              ? 'Newsletter sign-up is currently under construction.'
              : 'L’iscrizione alla newsletter è attualmente in fase di attivazione.'}
          </p>
        )}
        <form className='mt-6 flex flex-col gap-4' onSubmit={onSubmit} noValidate>
          <label className='sr-only' htmlFor='name'>
            {t.nameLabel}
          </label>
          <input
            id='name'
            type='text'
            autoComplete='given-name'
            placeholder={t.namePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='h-10 w-full rounded-full border border-black/10 bg-white px-4 text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(null);
              }}
              onBlur={() => {
                if (!email.trim()) return;
                const res = validateEmail(email);
                setEmailError(res.ok ? null : res.reason ?? 'invalid');
              }}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'newsletter-email-error' : undefined}
              className='h-10 w-full md:flex-1 md:max-w-none rounded-full border border-black/10 bg-white px-4 text-sm text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--paguro-deep)]/40'
            />

            <div className='flex justify-center md:justify-end md:ml-4'>
              <Button className='px-10' disabled={!newsletterActive}>
                {buttonLabel}
              </Button>
            </div>
          </div>
          {emailErrorMessage ? (
            <p
              id='newsletter-email-error'
              role='alert'
              className='px-4 text-xs text-red-600'
            >
              {emailErrorMessage}
            </p>
          ) : null}
        </form>

        <p className='t-card-body mt-4 text-center'>{t.privacy}</p>
      </section>
    </div>
  );
}
