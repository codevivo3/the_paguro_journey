// src/sanity/schemaTypes/documents/author.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Identity                                                               */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Profile                                                                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      description: 'Short author bio (shown on posts or author page)',
      validation: (r) => r.max(300),
    }),

    /* ---------------------------------------------------------------------- */
    /* Links (optional)                                                       */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),

    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      fields: [
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'x', title: 'X / Twitter', type: 'url' }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title,
        media,
      };
    },
  },
});
