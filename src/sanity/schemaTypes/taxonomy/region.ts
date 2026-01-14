// src/sanity/schemaTypes/taxonomy/region.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'region',
  title: 'Region',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Region name',
      type: 'string',
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
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Parent relationship                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      validation: (r) => r.required(),
      description: 'Country this region belongs to',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional metadata                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Optional intro text (travel guides, listings)',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      country: 'country.title',
    },
    prepare({ title, country }) {
      return {
        title,
        subtitle: country ? `Country: ${country}` : undefined,
      };
    },
  },
});
