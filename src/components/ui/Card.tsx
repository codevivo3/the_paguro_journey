/****
 * Card.tsx
 *
 * Reusable, theme-aware Card primitives.
 * IMPORTANT:
 * - Avoid nested links. If you use <Card href="..."> do NOT put <Link> inside.
 * - Prefer linking specific parts (media / CTA) via <Link> like you do in Destinations.
 ****/

import * as React from 'react';
import Link from 'next/link';

// Utility: conditionally join class names
type ClassValue = string | undefined | null | false;
function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/* Base Card                                                                  */
/* -------------------------------------------------------------------------- */

export function Card({
  children,
  className,
  href,
  external,
  ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * Optional full-card link (overlay).
   * WARNING: do not render other <a>/<Link> inside when href is set.
   */
  href?: string;
  external?: boolean;
  ariaLabel?: string;
}) {
  const cardClasses = cx(
    'group relative overflow-hidden rounded-md border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg [&_a]:pointer-events-auto',
    href
      ? 'focus-within:ring-2 focus-within:ring-[color:var(--paguro-ocean)] focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--paguro-bg)]'
      : undefined,
    className
  );

  const overlayClassName = 'absolute inset-0 z-20 cursor-pointer';

  // If href is provided, we render an overlay link.
  // Content stays clickable/accessible only if you DON'T nest other links.
  return (
    <article className={cardClasses}>
      {href ? (
        external ? (
          <a
            href={href}
            target='_blank'
            rel='noreferrer'
            aria-label={ariaLabel ?? 'Apri'}
            className={overlayClassName}
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </a>
        ) : (
          <Link
            href={href}
            aria-label={ariaLabel ?? 'Apri'}
            className={overlayClassName}
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </Link>
        )
      ) : null}

      {/* Content is above background, below overlay. */}
      <div className='relative z-10 flex h-full flex-col'>{children}</div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout blocks                                                              */
/* -------------------------------------------------------------------------- */

export function CardMedia({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        // Media should always feel clickable when it contains a link.
        // Some overlays/skeletons can sit above the image and steal the hover cursor.
        // For UX, we enforce pointer cursor across the whole media block.
        'relative w-full bg-black/10 cursor-pointer',
        '[&_a]:pointer-events-auto [&_a]:cursor-pointer',
        '[&_*]:cursor-pointer',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cx('flex flex-col p-6 min-h-[10.5rem]', className)}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cx('t-card-title', className)}>{children}</h3>;
}

export function CardText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cx('t-card-body mt-2', className)}>{children}</p>;
}

export function CardMetaRow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('mt-3 flex items-center justify-between gap-4', className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Links / Pills                                                              */
/* -------------------------------------------------------------------------- */

export function CardLink({
  href,
  children,
  className,
  external,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
}) {
  const base =
    'mt-auto inline-flex cursor-pointer items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]';

  if (external) {
    return (
      <a href={href} target='_blank' rel='noreferrer' className={cx(base, className)}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cx(base, className)}>
      {children}
    </Link>
  );
}

/**
 * CardPill
 * Canonical pill primitive (glass style).
 * - If `href` is provided → renders a Link
 * - Otherwise → renders a <span>
 */
export function CardPill({
  href,
  children,
  className,
  ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const pillClassName = cx(
    'inline-flex h-8 items-center justify-center rounded-3xl px-2 text-xs font-bold',
    'transition-[transform,box-shadow,background] duration-200',
    'bg-gradient-to-b from-[var(--pill-from)] to-[var(--pill-to)]',
    'hover:from-[var(--pill-from-hover)] hover:to-[var(--pill-to-hover)]',
    'border border-white/25 shadow-sm',
    'text-[color:var(--pill-text)]',
    '[font-family:var(--font-ui)]',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/50',
    'motion-reduce:transition-none',
    className
  );

  if (!href) {
    return <span className={pillClassName}>{children}</span>;
  }

  return (
    <Link href={href} aria-label={ariaLabel ?? 'Apri filtro'} className={cx(pillClassName, 'cursor-pointer')}>
      {children}
    </Link>
  );
}
