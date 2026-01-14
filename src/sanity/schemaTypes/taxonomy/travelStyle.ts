// src/sanity/schemaTypes/taxonomy/travelStyle.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'travelStyle',
  title: 'Travel Style',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Travel style',
      type: 'string',
      validation: (r) => r.required(),
      description: 'e.g. Adventure, Slow Travel, Sailing, Food & Wine',
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional helpers                                                       */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional explanation shown in guides or filters',
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
    prepare({ title }) {
      return {
        title,
      };
    },
  },
});
