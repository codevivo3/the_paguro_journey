import 'server-only';
// src/sanity/lib/client.ts
import { createClient } from 'next-sanity';
/**
 * Environment-derived Sanity configuration.
 *
 * - projectId  → NEXT_PUBLIC_SANITY_PROJECT_ID
 * - dataset    → NEXT_PUBLIC_SANITY_DATASET
 * - apiVersion → NEXT_PUBLIC_SANITY_API_VERSION
 *
 * `apiVersion` MUST be a fixed date string (YYYY-MM-DD).
 * It locks query behavior and prevents breaking changes
 * when Sanity evolves its API.
 */
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
 * - apiVersion:
 *   - Explicitly set via NEXT_PUBLIC_SANITY_API_VERSION.
 *   - Never left implicit to avoid unexpected API changes.
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

// -----------------------------------------------------------------------------
// Preview client (drafts + published)
// Used ONLY when Next.js Draft Mode is enabled
// -----------------------------------------------------------------------------

// IMPORTANT: Preview (drafts) requires an authenticated token.
// Prefer a READ token if you create one; falling back to the write token is OK but riskier.
const previewToken =
  process.env.SANITY_API_READ_TOKEN || process.env.SANITY_API_WRITE_TOKEN;

export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,

  // Preview requires auth to read drafts
  token: previewToken,
  ignoreBrowserTokenWarning: true,

  // Never use CDN for previews (must read fresh drafts)
  useCdn: false,

  // Include drafts + published documents
  perspective: 'previewDrafts',
});
