// src/sanity/env.ts

/**
 * Centralized Sanity environment values.
 *
 * Keep this file “pure”: no client creation, no live setup.
 * This avoids circular imports and browser/runtime side effects.
 */

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-01-13';

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
