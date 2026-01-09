/****
 * Card.tsx
 *
 * This file defines a reusable, theme-aware Card component system designed to provide consistent styling
 * and layout across different content types such as Blog posts, Videos, and Destinations.
 * The components leverage CSS variables for colors and support flexible composition for various UI needs.
 ****/

import * as React from 'react';
import Link from 'next/link';
import Button from './Button';

// Utility function to conditionally join class names, filtering out falsy values
type ClassValue = string | undefined | null | false;

function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

/* ---------------------------------- */
/* Base Card Component                */
/* ---------------------------------- */

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
   * If provided, the whole card becomes clickable and navigates to this URL.
   * IMPORTANT: avoid rendering other <a>/<Link> inside the card when this is set (nested links are invalid HTML).
   */
  href?: string;
  /** Open href in a new tab (only applies when href is provided). */
  external?: boolean;
  /** Accessible label for the full-card link (recommended when href is provided). */
  ariaLabel?: string;
}) {
  const cardClasses = cx(
    // Shared “Paguro card” styling
    'group relative overflow-hidden rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg',
    href
      ? 'cursor-pointer focus-within:ring-2 focus-within:ring-[color:var(--paguro-ocean)] focus-within:ring-offset-2 focus-within:ring-offset-[color:var(--paguro-bg)]'
      : undefined,
    className
  );

  return (
    <article className={cardClasses}>
      {href ? (
        external ? (
          <a
            href={href}
            target='_blank'
            rel='noreferrer'
            aria-label={ariaLabel ?? 'Apri'}
            className='absolute inset-0 z-30'
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </a>
        ) : (
          <Link
            href={href}
            aria-label={ariaLabel ?? 'Apri'}
            className='absolute inset-0 z-30'
          >
            <span className='sr-only'>{ariaLabel ?? 'Apri'}</span>
          </Link>
        )
      ) : null}

      {/*
        Keep the real content above the overlay link.
        This preserves text selection + allows you to add non-link controls later.
      */}
      <div className='relative z-10'>{children}</div>
    </article>
  );
}

/* ---------------------------------- */
/* Layout Blocks                     */
/* ---------------------------------- */

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
  // Flex column layout allows content stacking;
  // mt-auto can be used in children to push elements (like CTA) to the bottom
  return (
    <div className={cx('flex min-h-[10.5rem] flex-col p-6', className)}>
      {children}
    </div>
  );
}

/* ---------------------------------- */
/* Typography Helpers                */
/* ---------------------------------- */

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

/* ---------------------------------- */
/* Meta and Call-to-Action Helpers  */
/* ---------------------------------- */

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

export function CardPill({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={''}
      className={cx(
        'rounded-full border-2 border-[color:var(--paguro-border)] bg-white/50 px-3 py-1 text-xs text-black/80 h-10 w-auto',
        className
      )}
    >
      {children}
    </Link>
  );
}

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
    // mt-auto pushes the link to the bottom inside a flex-col container (like CardBody)
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
        // Square tile card, slightly softer hover than the default cards
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

  // External URLs open in a new tab
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

  // mailto: should be a normal <a>
  if (href.startsWith('mailto:')) {
    return (
      <a href={href} className='block h-full'>
        {content}
      </a>
    );
  }

  // Internal navigation
  return (
    <Link href={href} className='block h-full'>
      {content}
    </Link>
  );
}
