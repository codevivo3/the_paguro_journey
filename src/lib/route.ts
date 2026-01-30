

// src/lib/route.ts

export type Lang = 'it' | 'en';

function isExternalHref(href: string): boolean {
  return (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:')
  );
}

function isHashOnly(href: string): boolean {
  return href.startsWith('#');
}

function isAlreadyPrefixed(href: string): boolean {
  return /^\/(it|en)(?=\/|$)/.test(href);
}

/**
 * Prefixes an internal path with the language segment.
 *
 * Examples:
 * - withLangPrefix('it', '/') -> '/it'
 * - withLangPrefix('en', '/blog') -> '/en/blog'
 * - withLangPrefix('it', '/en/blog') -> '/en/blog' (already prefixed)
 * - withLangPrefix('it', 'https://x.com') -> unchanged (external)
 * - withLangPrefix('it', '#section') -> unchanged (hash)
 */
export function withLangPrefix(lang: Lang, href: string): string {
  if (!href) return `/${lang}`;
  if (isExternalHref(href) || isHashOnly(href)) return href;
  if (isAlreadyPrefixed(href)) return href;

  // Normalize home
  if (href === '/') return `/${lang}`;

  // Ensure leading slash
  const normalized = href.startsWith('/') ? href : `/${href}`;
  return `/${lang}${normalized}`;
}

/**
 * Removes a leading /it or /en segment from a pathname.
 *
 * Examples:
 * - stripLangPrefix('/it') -> '/'
 * - stripLangPrefix('/it/blog') -> '/blog'
 * - stripLangPrefix('/blog') -> '/blog'
 */
export function stripLangPrefix(pathname: string): string {
  if (!pathname) return '/';
  const rest = pathname.replace(/^\/(it|en)(?=\/|$)/, '');
  return rest ? (rest.startsWith('/') ? rest : `/${rest}`) : '/';
}

/**
 * Computes the same path in the other language, preserving the rest of the path.
 *
 * Examples:
 * - toggleLangPath('/it') -> '/en'
 * - toggleLangPath('/en/blog') -> '/it/blog'
 * - toggleLangPath('/blog', 'it') -> '/en/blog' (treats as unprefixed)
 */
export function toggleLangPath(pathname: string, current: Lang): string {
  const next: Lang = current === 'en' ? 'it' : 'en';
  const rest = stripLangPrefix(pathname);
  if (!rest || rest === '/') return `/${next}`;
  return `/${next}${rest}`;
}

/**
 * Normalizes any input to a safe Lang.
 */
export function safeLang(lang: unknown): Lang {
  return lang === 'en' ? 'en' : 'it';
}