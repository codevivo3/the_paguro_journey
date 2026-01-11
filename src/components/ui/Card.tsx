/****
 * Card.tsx
 *
 * This file defines a reusable, theme-aware Card component system designed to provide consistent styling
 * and layout across different content types such as Blog posts, Videos, and Destinations.
 * The components leverage CSS variables for colors and support flexible composition for various UI needs.
 ****/

import * as React from 'react';
import Link from 'next/link';

// Utility function to conditionally join class names, filtering out falsy values
type ClassValue = string | undefined | null | false;

function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

/* ---------------------------------- */
/* Base Card Component                */
/* ---------------------------------- */

/**
 * Card
 *
 * The base container component for card UI elements.
 * Supports optional full-card linking via href and external props.
 * Provides consistent styling, hover effects, and accessibility features.
 */
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

/**
 * CardMedia
 *
 * Container for media content inside a card (images, videos, etc.).
 * Provides background styling and sizing.
 */
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

/**
 * CardBody
 *
 * Container for the main textual/content area of a card.
 * Uses flex column layout to allow stacking content and pushing elements to the bottom.
 */
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

/**
 * CardTitle
 *
 * Styled heading element for card titles.
 */
export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h3 className={cx('t-card-title', className)}>{children}</h3>;
}

/**
 * CardText
 *
 * Styled paragraph element for card body text.
 */
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

/**
 * FactCard
 *
 * Specialized card component designed for displaying fact-based content with a title, pill label, and text.
 * Intended for use in masonry or mixed-content grids where consistent sizing and styling are important.
 * Lives in Card.tsx because it composes the base Card component and shares styling conventions.
 */
export function FactCard({
  title,
  pill,
  pillHref,
  pillAriaLabel,
  text,
  minHeightClass,
  footer,
  className,
}: {
  title: string;
  pill: string;
  pillHref: string;
  pillAriaLabel: string;
  text: string;
  minHeightClass?: string;
  footer?: React.ReactNode;
  className?: string;
}) {
  // Split the title by newline to allow multi-line display with special styling on second line
  const titleLines = title.split('\n');
  return (
    <Card className={cx('p-0', minHeightClass, className)}>
      <div className='flex flex-col p-6 h-full'>
        <div className='flex items-center justify-between gap-3'>
          <h3 className='t-card-title'>
            {titleLines[0]}
            {titleLines[1] ? (
              // Use whitespace-nowrap to prevent wrapping of the second line for better visual consistency
              <span className='block whitespace-nowrap'>{titleLines[1]}</span>
            ) : null}
          </h3>
          <Link
            href={pillHref}
            aria-label={pillAriaLabel}
            className='inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-3xl border border-white/50 bg-[color:var(--geo-btn)] px-3 [font-family:var(--font-ui)] text-xs font-semibold text-white shadow-sm hover:bg-[color:var(--paguro-coral)] shrink-0'
          >
            {pill}
          </Link>
        </div>
        <p className='t-card-body whitespace-pre-line mt-4'>{text}</p>
        {/* <div className='mt-auto pt-4'>
          - Render footer if provided, otherwise show fallback placeholder -
          {footer !== undefined ? footer : '(mock) ✦'}
        </div> */}
      </div>
    </Card>
  );
}

/**
 * CardMetaRow
 *
 * Layout helper to arrange metadata or controls in a horizontal row with spacing.
 */
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

/**
 * CardPill
 *
 * Visual pill-shaped link primitive for UI decoration and navigation.
 * Should not contain business logic or complex behavior.
 */
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

/**
 * CardLink
 *
 * Inline link component for use inside cards.
 * Use this when only part of the card should be clickable, as opposed to making the whole Card clickable via the href prop.
 */
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

/**
 * ContactCard
 *
 * Square tile card specialized for contact methods.
 * Displays an icon, title, and subtitle with hover effects.
 * Supports internal, external, and mailto: links.
 */
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
