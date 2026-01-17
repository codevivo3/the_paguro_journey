// src/sanity/schemaTypes/taxonomy/worldRegion.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'worldRegion',
  title: 'World Region (World Bank)',
  type: 'document',

  /**
   * This is seeded from the World Bank dataset.
   * We keep it “locked” so editors don’t create random regions.
   */

  // @ts-expect-error Sanity Studio supports __experimental_actions, but typings don't expose it.
  __experimental_actions: ['update', 'publish'], // disables create/delete in Studio

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
      name: 'wbCode',
      title: 'World Bank Code',
      type: 'string',
      readOnly: true,
      description: 'Optional internal code if your dataset provides one',
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      readOnly: true,
      description: 'Optional ordering for UI pills (lower comes first)',
      validation: (r) => r.min(0).integer(),
    }),
  ],

  preview: {
    select: { title: 'title' },
    prepare({ title }) {
      return {
        title: title || 'World Region',
        subtitle: 'World Bank',
      };
    },
  },
});
