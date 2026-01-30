export type Lang = 'it' | 'en';

type I18nTitle = {
  /** Already resolved by GROQ for the active language (preferred) */
  title?: string;

  /** Optional raw i18n titles (fallback) */
  titleI18n?: Partial<Record<Lang, string>>;
};

/**
 * Returns a display label for the requested language.
 *
 * Rule:
 * - Prefer `title` because our GROQ queries already resolve it via `$lang`.
 * - Fall back to `titleI18n[lang]` if `title` is missing (legacy / partial data).
 */
export function i18nLabel(value: I18nTitle | null | undefined, lang: Lang): string {
  if (!value) return '';
  return value.title ?? value.titleI18n?.[lang] ?? '';
}
