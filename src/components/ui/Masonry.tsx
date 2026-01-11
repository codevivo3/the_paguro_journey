import * as React from 'react';

type MasonryProps = {
  children: React.ReactNode;

  /**
   * Tailwind classes for the CSS-columns masonry layout.
   * Defaults match your Destinations/Blog/Gallery layouts.
   */
  className?: string;
};

/**
 * Masonry
 *
 * A tiny UI primitive that implements your “masonry-style” layout using CSS columns.
 *
 * Responsibilities:
 * - Provide the columns + gaps + vertical spacing container.
 *
 * Non-goals:
 * - No aspect-ratio logic (kept local to each page/component).
 * - No card styles (kept local to the content).
 */
export function Masonry({
  children,
  className = 'columns-1 gap-6 space-y-6 md:columns-2 lg:columns-3',
}: MasonryProps) {
  return <div className={className}>{children}</div>;
}

type MasonryItemProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * MasonryItem
 *
 * Wrap each item to prevent column breaks inside the card/tile.
 */
export function MasonryItem({
  children,
  className = 'break-inside-avoid',
}: MasonryItemProps) {
  return <div className={className}>{children}</div>;
}
