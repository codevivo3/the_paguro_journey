// src/sanity/schemaTypes/taxonomy/country.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'country',
  title: 'Country',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Country name',
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
    /* Metadata (optional but useful)                                         */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'isoCode',
      title: 'ISO Code',
      type: 'string',
      description: 'Optional (e.g. IT, TH, JP)',
      validation: (r) => r.max(3),
    }),

    defineField({
      name: 'flag',
      title: 'Flag',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Optional intro text (travel guides, hero sections)',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'flag',
      iso: 'isoCode',
    },
    prepare({ title, media, iso }) {
      return {
        title,
        subtitle: iso ? `ISO: ${iso}` : undefined,
        media,
      };
    },
  },
});
