// src/sanity/schemaTypes/taxonomy/worldRegion.ts
import { defineType, defineField } from 'sanity';

/**
 * World-level regions based on the World Bank classification.
 *
 * These documents are fully seeded via scripts and act as a
 * stable, read-only taxonomy used for:
 * - primary geographic filtering (UI pills)
 * - grouping countries at a macro level
 *
 * Editors should never create, delete, or manually edit these.
 * Any change must happen through controlled seed scripts.
 */

export default defineType({
  name: 'worldRegion',
  title: 'World Region (World Bank)',
  type: 'document',

  // 🔒 Lock the entire document in Studio (read-only, script-managed)
  readOnly: true,

  // Disable create/delete actions in Desk (runtime-supported, not typed)
  // @ts-expect-error Sanity supports this at runtime.
  __experimental_actions: ['update', 'publish'],

  fields: [
    defineField({
      name: 'title',
      title: 'Region name',
      type: 'string',
      readOnly: true,
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      readOnly: true,
      description: 'Controls visual ordering for region filters and navigation (lower comes first).',
      validation: (r) => r.integer().min(0),
    }),

    // Visual asset used across the site for this world region
    defineField({
      name: 'mapImage',
      title: 'Map image (highlight)',
      type: 'image',
      readOnly: true,
      options: { hotspot: false },
      description:
        'Seeded image representing this world region (used for hero maps, cards, and filters).',
    }),

    // Optional internal metadata (non-public)
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
      readOnly: true,
      description: 'Internal notes or metadata added during seeding. Not intended for frontend use.',
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
