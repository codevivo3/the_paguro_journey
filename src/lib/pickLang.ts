import type { Lang } from '@/lib/route';

export type I18nValue<T> = { it?: T | null; en?: T | null } | null | undefined;

/**
 * pickLang helper
 *
 * Supports two call styles:
 *
 * 1) Object-first (preferred, used with Sanity i18n objects):
 *    pickLang(value, lang)
 *
 * 2) Lang-first (legacy convenience):
 *    pickLang(lang, itValue, enValue)
 */
export function pickLang<T>(value: I18nValue<T>, lang: Lang): T | undefined;
export function pickLang<T>(lang: Lang, it?: T | null, en?: T | null): T | undefined;
export function pickLang<T>(
  a: Lang | I18nValue<T>,
  b: Lang | T | null | undefined,
  c?: T | null,
): T | undefined {
  // Style 2: pickLang(lang, it, en)
  if (a === 'it' || a === 'en') {
    const lang = a;
    const it = b as T | null | undefined;
    const en = c as T | null | undefined;
    return lang === 'en' ? (en ?? it ?? undefined) : (it ?? en ?? undefined);
  }

  // Style 1: pickLang(value, lang)
  const value = a as I18nValue<T>;
  const lang = b as Lang;

  if (!value) return undefined;

  return lang === 'en'
    ? ((value.en ?? value.it) ?? undefined)
    : ((value.it ?? value.en) ?? undefined);
}
