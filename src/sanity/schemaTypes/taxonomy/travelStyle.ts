// src/sanity/schemaTypes/taxonomy/travelStyle.ts

/**
 * Travel Style taxonomy.
 *
 * Used to describe *how* a destination or post is experienced,
 * not *where* it is.
 *
 * Examples:
 * - Slow Travel
 * - Digital Nomad
 * - Sailing
 * - Backpacking
 *
 * Editorial rule:
 * - Travel Styles are created organically by editors when needed.
 * - They are reused across Posts, Destinations, and Media.
 */

import { defineType, defineField } from 'sanity';

type UnknownRecord = Record<string, unknown>;

/**
 * Helper to detect whether a slug already exists.
 * Used to lock the slug after first creation to keep URLs stable.
 */
function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = (doc?.['slug'] as UnknownRecord | undefined) ?? undefined;
  return slug?.['current'] as string | undefined;
}

export default defineType({
  name: 'travelStyle',
  title: 'Travel Style',
  type: 'document',

  // Allow create/update/publish, but intentionally no delete
  // (prevents breaking references across content)
  // @ts-expect-error Sanity supports this at runtime
  __experimental_actions: ['create', 'update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Travel style name',
      type: 'string',
      description:
        'Human-readable label used in filters, cards, and UI elements ' +
        '(e.g. Slow Travel, Digital Nomad, Sailing).\n' +
        'Naming convention: use Title Case, singular, and descriptive terms ' +
        '(avoid abbreviations and overly generic labels).',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      // Lock slug after first save to avoid URL churn
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      description:
        'Auto-generated from the Travel Style name. Locked after creation to keep URLs stable.',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional editorial context                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description:
        'Optional short explanation of this travel style. ' +
        'Used for UI tooltips, filters, or future landing pages.',
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description:
        'Optional manual ordering for dropdowns or curated lists. ' +
        'Lower values appear first.',
      validation: (r) => r.min(0).integer(),
    }),
  ],

  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title || 'Travel Style',
        subtitle: 'Taxonomy',
      };
    },
  },
});
