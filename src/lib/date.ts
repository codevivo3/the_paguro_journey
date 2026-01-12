type SupportedLocale = 'it' | 'en';

const LOCALE_MAP: Record<SupportedLocale, string> = {
  it: 'it-IT',
  en: 'en-US',
};

const DEFAULT_FORMATS: Record<SupportedLocale, Intl.DateTimeFormatOptions> = {
  it: {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  },
  en: {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  },
};

export function formatDate(
  date: string | Date,
  locale: SupportedLocale = 'it',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  return new Intl.DateTimeFormat(
    LOCALE_MAP[locale],
    options ?? DEFAULT_FORMATS[locale]
  ).format(d);
}
