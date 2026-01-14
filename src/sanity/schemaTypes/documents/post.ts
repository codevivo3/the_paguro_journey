// src/sanity/schemaTypes/documents/post.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'post',
  title: 'Post',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Title',
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
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary used in listings and previews',
      validation: (r) => r.max(200),
    }),

    /* ---------------------------------------------------------------------- */
    /* Content                                                                 */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        { type: 'block' },

        // Media blocks (reuse Media bucket)
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
        },
      ],
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Meta                                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Relations (optional, future-proof)                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
    }),

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'travelStyle' }] }],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      status: 'status',
      publishedAt: 'publishedAt',
    },
    prepare({ title, status, publishedAt }) {
      return {
        title,
        subtitle:
          status === 'published'
            ? `Published · ${publishedAt ? new Date(publishedAt).toLocaleDateString() : ''}`
            : 'Draft',
      };
    },
  },
});
