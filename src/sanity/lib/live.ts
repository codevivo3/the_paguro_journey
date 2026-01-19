// src/sanity/lib/live.ts
import { defineLive } from 'next-sanity/live';
import { client } from './client';

/**
 * Sanity Live Content helpers.
 *
 * Goal:
 * - Enable live-updating content ONLY during local development.
 * - Avoid subscriptions in production (performance + stability).
 * - Explicitly disable live behavior inside Sanity Studio routes
 *   to prevent AbortError noise and dev overlay crashes.
 *
 * Why this exists:
 * - `defineLive` uses subscriptions under the hood.
 * - Subscriptions + hot reload + route changes can easily cause
 *   AbortError if not tightly controlled.
 * - This file centralizes the decision so the rest of the app
 *   doesn’t need to care.
 */

// -----------------------------------------------------------------------------
// Live mode switch (very defensive on purpose)
// -----------------------------------------------------------------------------

const enableLive =
  process.env.NODE_ENV === 'development' &&
  typeof window !== 'undefined' && // client-side only
  !window.location.pathname.startsWith('/studio'); // NEVER inside Studio

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/**
 * sanityFetch
 *
 * - Drop-in replacement for `client.fetch`.
 * - Uses live subscriptions in dev (outside Studio).
 * - Falls back to plain fetch everywhere else.
 *
 * Usage:
 *   const data = await sanityFetch(query, params)
 */
export const sanityFetch = enableLive
  ? defineLive({ client }).sanityFetch
  : client.fetch;

/**
 * SanityLive
 *
 * - React component required by the Live Content API.
 * - Must be rendered once (usually in the root layout).
 * - Automatically becomes a no-op when live mode is disabled.
 *
 * IMPORTANT:
 * - Do NOT render this inside `/studio`.
 * - Safe to render globally thanks to the guard above.
 */
export const SanityLive = enableLive
  ? defineLive({ client }).SanityLive
  : () => null;
