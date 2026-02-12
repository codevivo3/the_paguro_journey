// src/sanity/lib/live.ts
import { defineLive } from 'next-sanity/live';
import { client } from './client';

type QueryParams = Record<string, unknown>;

type SanityFetchOptions = {
  query: string;
  params?: QueryParams;

  /**
   * Next.js ISR revalidation (seconds). If omitted, Next.js uses its default caching behavior.
   * In Draft/Preview mode you should bypass caching (usually `cache: 'no-store'`).
   */
  revalidate?: number;

  /**
   * Next.js cache tags for on-demand invalidation via `revalidateTag()`.
   * Example: tags: ['gallery', `post:${slug}`]
   */
  tags?: string[];

  /**
   * Next.js fetch cache mode.
   * Useful for Draft/Preview mode where you want to bypass caching entirely.
   * Example: cache: 'no-store'
   */
  cache?: RequestCache;
};
/**
 * Sanity Live Content helpers.
 *
 * Goal:
 * - Enable live-updating content ONLY during local development.
 * - Avoid subscriptions in production (performance + stability).
 * - Explicitly disable live behavior inside Sanity Studio routes
 *   to prevent AbortError noise and dev overlay crashes.
 */

// Live mode switch (very defensive on purpose)
const enableLive =
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' &&
  !window.location.pathname.startsWith('/studio');

// Create the live helpers once
const live = defineLive({ client });

/**
 * Unified fetch helper.
 *
 * - In dev (outside /studio) we use `next-sanity/live` subscriptions for instant updates.
 * - In prod we use plain `client.fetch` with optional Next.js caching controls.
 *
 * Notes:
 * - Sanity `client.fetch` does not like `undefined` params in some TS overloads.
 * - If you need on-demand updates after publish, pass `tags` and call `revalidateTag()` (or `revalidatePath()`) from your webhook route.
 */
export function sanityFetch<R = unknown>(opts: SanityFetchOptions) {
  if (enableLive) {
    // NOTE: `live.sanityFetch` generics are ordered with the query type first (constrained to `string`).
    // Passing `<R>` here makes TS think `R` is the query type, causing: "Type 'R' does not satisfy the constraint 'string'."
    // We keep *our* wrapper generic (`R`) and cast the promise shape.
    return live.sanityFetch(opts) as Promise<R>;
  }

  // Build Next.js caching options only when provided.
  const next =
    opts.cache !== undefined ||
    opts.revalidate !== undefined ||
    (opts.tags && opts.tags.length)
      ? {
          ...(opts.cache !== undefined ? { cache: opts.cache } : {}),
          next: {
            ...(opts.revalidate !== undefined ? { revalidate: opts.revalidate } : {}),
            ...(opts.tags && opts.tags.length ? { tags: opts.tags } : {}),
          },
        }
      : undefined;

  // Only pass params if they exist (avoids TS overload weirdness)
  if (opts.params) {
    return next
      ? client.fetch<R>(opts.query, opts.params, next)
      : client.fetch<R>(opts.query, opts.params);
  }

  // If we have Next options but no params, pass an empty params object to reach the 3rd argument safely.
  return next
    ? client.fetch<R>(opts.query, {}, next)
    : client.fetch<R>(opts.query);
}

export const SanityLive = enableLive ? live.SanityLive : () => null;
