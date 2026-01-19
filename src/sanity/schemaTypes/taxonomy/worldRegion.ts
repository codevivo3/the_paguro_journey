// src/sanity/schemaTypes/taxonomy/worldRegion.ts

import { defineType, defineField } from 'sanity';

/**
 * World-level regions based on the World Bank classification.
 *
 * This is a **global, read-only taxonomy** used to group countries
 * at a macro level (e.g. Europe & Central Asia, East Asia & Pacific).
 *
 * Purpose:
 * - high-level geographic filtering (UI pills, navigation)
 * - grouping countries under a stable, external standard
 *
 * Editorial rules:
 * - These documents are fully seeded via scripts.
 * - Editors must NOT create, delete, or manually edit them.
 * - Any change must go through controlled seed scripts only.
 *
 * Think of this as infrastructure, not content.
 */

export default defineType({
  name: 'worldRegion',
  title: 'World Region (World Bank)',
  type: 'document',

  // 🔒 Lock the entire document in Studio (script-managed, read-only)
  readOnly: true,

  // Prevent create/delete in Desk UI (runtime-supported, not typed)
  // @ts-expect-error Sanity supports this at runtime
  __experimental_actions: ['update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity (seeded, immutable)                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Region name',
      type: 'string',
      readOnly: true,
      description:
        'Official World Bank region name. Seeded automatically and kept immutable.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      options: { source: 'title', maxLength: 96 },
      description:
        'URL-safe identifier derived from the region name. Used internally for routing and filters.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      readOnly: true,
      description:
        'Controls visual ordering in UI elements (filters, navigation). Lower values appear first.',
      validation: (r) => r.integer().min(0),
    }),

    /* ---------------------------------------------------------------------- */
    /* Visual asset                                                           */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'mapImage',
      title: 'Map image (highlight)',
      type: 'image',
      readOnly: true,
      options: { hotspot: false },
      description:
        'Seeded visual representation of this world region. ' +
        'Used for hero maps, region cards, and high-level navigation.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Internal metadata                                                       */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
      readOnly: true,
      description:
        'Optional internal notes added during seeding (debugging, provenance, or data source hints). ' +
        'Not intended for frontend or editorial use.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mapImage',
    },
    prepare({ title, media }) {
      return {
        title: title || 'World Region',
        subtitle: 'World Bank classification',
        media,
      };
    },
  },
});
