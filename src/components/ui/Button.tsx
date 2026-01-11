import Link from 'next/link';
import { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
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
  onClick,
  className = '',
  external = false,
}: ButtonProps) {
  const baseClass =
    'inline-flex items-center gap-2 rounded-full bg-[color:var(--paguro-ocean)] px-6 py-3 text-lg transition-colors hover:bg-[color:var(--paguro-link-hover)] font-extrabold [font-family:var(--font-ui)]';

  // Button element (action)
  if (!href) {
    return (
      <button onClick={onClick} className={`${baseClass} ${className}`}>
        {children}
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
        {children}
      </a>
    );
  }

  // Internal link
  return (
    <Link href={href} className={`${baseClass} ${className}`}>
      {children}
    </Link>
  );
}
