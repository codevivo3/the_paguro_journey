// src/sanity/lib/client.ts
import { createClient } from 'next-sanity';
import { apiVersion, dataset, projectId } from '../env';

/**
 * Primary Sanity client for the application.
 *
 * Philosophy:
 * - This client is for READ operations only (queries from the app).
 * - Writes / mutations should happen via scripts or Studio.
 *
 * Key decisions:
 * - useCdn:
 *   - Enabled only in production for performance.
 *   - Disabled in dev to avoid stale data and live-edge quirks.
 *
 * - perspective: 'published'
 *   - Ensures stable reads.
 *   - Drafts are NOT included unless explicitly required elsewhere.
 *
 * Guardrails:
 * - Fail fast if required env vars are missing.
 *   This prevents silent runtime bugs that are hard to trace.
 */

// -----------------------------------------------------------------------------
// Environment validation (fail fast)
// -----------------------------------------------------------------------------

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
}

if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
}

// -----------------------------------------------------------------------------
// Client instance
// -----------------------------------------------------------------------------

export const client = createClient({
  projectId,
  dataset,
  apiVersion,

  // Use CDN only in production for performance
  useCdn: process.env.NODE_ENV === 'production',

  // Read published content only (stable + predictable)
  perspective: 'published',
});
