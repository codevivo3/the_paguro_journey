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
/* Base Card                                                                   */
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
    'group relative overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg',
    href
      ? 'cursor-pointer focus-within:ring-2 focus-within:ring-[color:var(--paguro-ocean)] focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--paguro-bg)]'
      : undefined,
    className
  );

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
            className='absolute inset-0 z-20'
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </a>
        ) : (
          <Link
            href={href}
            aria-label={ariaLabel ?? 'Apri'}
            className='absolute inset-0 z-20'
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </Link>
        )
      ) : null}

      {/* Content is above background, below overlay. */}
      <div className='relative z-10'>{children}</div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Layout blocks                                                               */
/* -------------------------------------------------------------------------- */

export function CardMedia({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx('relative w-full bg-black/10', className)}>
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
  return (
    <div className={cx('flex min-h-[10.5rem] flex-col p-6', className)}>
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Typography                                                                  */
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
    <div
      className={cx('mt-3 flex items-center justify-between gap-4', className)}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Links / Pills                                                               */
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
    'mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]';

  if (external) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noreferrer'
        className={cx(base, className)}
      >
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
 * Simple pill primitive. You pass href. If empty, it renders a <span> (no broken links).
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
  const pillClasses = cx(
    'inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-3xl border border-white/50 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--paguro-coral)]',
    className
  );

  if (!href) {
    return <span className={pillClasses}>{children}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? 'Apri filtro'}
      className={pillClasses}
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* FactCard                                                                    */
/* -------------------------------------------------------------------------- */

export function FactCard({
  title,
  pill,
  pillHref,
  pillAriaLabel,
  text,
  minHeightClass,
  className,
}: {
  title: string;
  pill: string;
  pillHref?: string;
  pillAriaLabel?: string;
  text: string;
  minHeightClass?: string;
  className?: string;
}) {
  const titleLines = title.split('\n');

  return (
    <Card className={cx('p-0', minHeightClass, className)}>
      <div className='flex h-full flex-col p-6'>
        <div className='flex items-center justify-between gap-3'>
          <h3 className='t-card-title'>
            {titleLines[0]}
            {titleLines[1] ? (
              <span className='block whitespace-nowrap'>{titleLines[1]}</span>
            ) : null}
          </h3>

          <CardPill href={pillHref} ariaLabel={pillAriaLabel}>
            {pill}
          </CardPill>
        </div>

        <p className='t-card-body mt-4 whitespace-pre-line'>{text}</p>
      </div>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* ContactCard                                                                 */
/* -------------------------------------------------------------------------- */

export function ContactCard({
  href,
  title,
  subtitle,
  Icon,
  external,
  className,
}: {
  href: string;
  title: string;
  subtitle: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  external?: boolean;
  className?: string;
}) {
  const content = (
    <Card
      className={cx(
        'aspect-square p-2 hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
    >
      <div className='flex h-full flex-col items-center justify-center text-center'>
        <div className='grid h-16 w-16 place-items-center rounded-2xl border border-[color:var(--paguro-border)] bg-[color:var(--paguro-icon-bg)] text-[color:var(--paguro-icon-fg)] shadow-sm transition-all duration-300 group-hover:bg-[color:var(--paguro-ocean)]/20 group-hover:scale-105 group-hover:text-[color:var(--paguro-coral)]'>
          <Icon className='h-9 w-9' />
        </div>

        <div className='mt-4 space-y-1'>
          <div className='[font-family:var(--font-ui)] text-lg font-semibold text-[color:var(--paguro-text)]'>
            {title}
          </div>
          <div className='text-xs text-[color:var(--paguro-text-muted)]'>
            {subtitle}
          </div>
        </div>
      </div>
    </Card>
  );

  if (external) {
    return (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='block h-full'
      >
        {content}
      </a>
    );
  }

  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className='block h-full'>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className='block h-full'>
      {content}
    </Link>
  );
}
