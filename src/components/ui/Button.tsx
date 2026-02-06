import Link from 'next/link';
import { ReactNode, ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  external?: boolean;
};

/**
 * Button
 * ------------------------------------------------------------------
 * Reusable primary button component.
 *
 * - Uses Paguro semantic color tokens (no hardcoded colors)
 * - Supports:
 *   • internal links (Next.js Link)
 *   • external links (<a>)
 *   • button actions (onClick)
 * - Styling is centralized to keep visual consistency across the project
 */
export default function Button({
  children,
  href,
  className = '',
  external = false,
  type = 'button',
  ...rest
}: ButtonProps) {
  const baseClass =
    'group relative inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-center ' +
    '[font-family:var(--font-ui)] text-white overflow-hidden transition-all duration-300 ' +
    'bg-[color:var(--paguro-ocean)] ' +
    'before:absolute before:inset-0 before:z-0 before:bg-[color:var(--paguro-link-hover)] ' +
    'before:translate-x-[-100%] before:transition-transform before:duration-500 ' +
    // Overshoot easing so the fill "bounces" slightly at the end.
    'before:[transition-timing-function:cubic-bezier(.2,1.8,.4,1)] ' +
    'motion-reduce:before:[transition-timing-function:ease-out] ' +
    'hover:before:translate-x-0 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

  // Button element (action)
  if (!href) {
    return (
      <button type={type} {...rest} className={`${baseClass} ${className}`}>
        <span className='relative z-10'>{children}</span>
      </button>
    );
  }

  // External link
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${baseClass} ${className}`}
      >
        <span className='relative z-10'>{children}</span>
      </a>
    );
  }

  // Internal link
  return (
    <Link href={href} className={`${baseClass} ${className}`}>
      <span className='relative z-10'>{children}</span>
    </Link>
  );
}
