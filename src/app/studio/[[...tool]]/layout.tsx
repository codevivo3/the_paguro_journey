import type { Metadata } from 'next';

/**
 * Studio metadata
 * - Hidden from search engines
 * - Kept separate from the public site SEO
 */
export const metadata: Metadata = {
  title: 'Studio | The Paguro Journey',
  robots: { index: false, follow: false },
};

/**
 * StudioLayout
 *
 * Purpose:
 * - Provides a stable wrapper for Sanity Studio routes
 * - Exposes a single `.studio-shell` hook for global CSS
 *
 * Why this exists:
 * - Allows Studio to occupy the full viewport (100svh)
 * - Prevents the outer document (html/body) from adding scrollbars or gutters
 * - Keeps Studio behavior isolated from the public site layout and theme
 *
 * NOTE:
 * - All viewport sizing and overflow rules are handled in `globals.css`
 *   using the `.studio-shell` selector.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="studio-shell">{children}</div>;
}
