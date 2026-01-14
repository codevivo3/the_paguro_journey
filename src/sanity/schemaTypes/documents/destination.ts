// src/sanity/schemaTypes/documents/destination.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Destination name',
      type: 'string',
      validation: (r) => r.required(),
      description: 'e.g. Thailand, Bangkok, Sicily, Aegean Sea',
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
    /* Geography                                                              */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'region',
      title: 'Region',
      type: 'reference',
      to: [{ type: 'region' }],
      description: 'Optional (e.g. Southeast Asia, Mediterranean)',
    }),

    /* ---------------------------------------------------------------------- */
    /* Editorial content                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'excerpt',
      title: 'Short intro',
      type: 'text',
      rows: 3,
      description: 'Used in destination cards and previews',
    }),

    defineField({
      name: 'body',
      title: 'Main content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Long-form destination guide or overview',
    }),

    /* ---------------------------------------------------------------------- */
    /* Media                                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: {
        filter: 'type == "image"',
      },
      description: 'Primary visual for destination pages',
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: {
            filter: 'type == "image"',
          },
        },
      ],
      description: 'Optional destination gallery',
    }),

    /* ---------------------------------------------------------------------- */
    /* Travel context                                                         */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'travelStyles',
      title: 'Travel styles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'travelStyle' }] }],
      description: 'Helps filtering and discovery',
    }),

    /* ---------------------------------------------------------------------- */
    /* Status & ordering                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'featured',
      title: 'Featured destination',
      type: 'boolean',
      initialValue: false,
    }),

    defineField({
      name: 'order',
      title: 'Manual order',
      type: 'number',
      description: 'Optional ordering for curated lists',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      country: 'country.title',
      media: 'coverImage.image',
    },
    prepare({ title, country, media }) {
      return {
        title,
        subtitle: country ? `Country: ${country}` : undefined,
        media,
      };
    },
  },
});
