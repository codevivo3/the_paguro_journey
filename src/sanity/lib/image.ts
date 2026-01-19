// src/sanity/lib/image.ts
import createImageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

import { dataset, projectId } from '../env';

/**
 * Sanity image URL helper.
 *
 * Purpose:
 * - Centralizes image URL generation for all Sanity images.
 * - Keeps image transformations (size, format, quality, etc.)
 *   consistent across the app.
 *
 * Usage:
 *   urlFor(image)
 *     .width(1200)
 *     .height(800)
 *     .fit('crop')
 *     .auto('format')
 *     .url()
 *
 * Notes:
 * - This helper assumes `image` is a valid Sanity image source
 *   (e.g. an image field or image.asset reference).
 * - Always prefer using this helper instead of constructing URLs manually.
 *
 * Docs:
 * https://www.sanity.io/docs/image-url
 */

// -----------------------------------------------------------------------------
// Guardrails
// -----------------------------------------------------------------------------

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
}

if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');
}

// -----------------------------------------------------------------------------
// Image URL builder
// -----------------------------------------------------------------------------

const builder = createImageUrlBuilder({
  projectId,
  dataset,
});

// -----------------------------------------------------------------------------
// Public helper
// -----------------------------------------------------------------------------

/**
 * Generate a Sanity image URL builder from a source image.
 *
 * @example
 *   urlFor(image).width(800).auto('format').url()
 */
export const urlFor = (source: SanityImageSource) => {
  return builder.image(source);
};
