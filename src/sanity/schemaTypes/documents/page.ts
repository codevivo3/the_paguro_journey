// src/sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',

  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
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

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
    }),

    defineField({
      name: 'content',
      title: 'Page content',
      type: 'array',
      of: [{ type: 'block' }, { type: 'image' }],
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),
  ],

  preview: {
    select: {
      title: 'title',
    },
  },
});
