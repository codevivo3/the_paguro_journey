// src/sanity/schemaTypes/taxonomy/worldRegion.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'worldRegion',
  title: 'World Region (World Bank)',
  type: 'document',

  /**
   * Seeded data.
   * Goal: editors should NOT create/delete/mess with these.
   * Updates happen via scripts.
   */

  // Locks the whole document editing UI in Studio
  readOnly: true,

  // Disable create/delete in Desk (typings don't expose it)
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
      description: 'Controls pill order (lower comes first).',
      validation: (r) => r.integer().min(0),
    }),

    // ✅ This is the “final polish” field
    defineField({
      name: 'mapImage',
      title: 'Map image (highlight)',
      type: 'image',
      readOnly: true,
      options: { hotspot: false },
      description:
        'Seeded image used in UI (e.g. the highlighted world map for this region).',
    }),

    // Optional: useful for UI labels, not required
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
      readOnly: true,
      description: 'Optional internal notes (seeded).',
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
        subtitle: 'World Bank',
        media,
      };
    },
  },
});
