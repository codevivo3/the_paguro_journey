// src/sanity/schemaTypes/documents/mediaItem.ts
import { defineField, defineType } from 'sanity';

type MediaType = 'image' | 'video';

export default defineType({
  name: 'mediaItem',
  title: 'Media Item',
  type: 'document',
  fields: [
    // -----------------------------------------------------------------------
    // Core switch: image vs video
    // -----------------------------------------------------------------------
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    // Optional internal title (helps editors search)
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
    }),

    // -----------------------------------------------------------------------
    // Image fields
    // -----------------------------------------------------------------------
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Image required';
          return true;
        }),
    }),

    defineField({
      name: 'alt',
      title: 'Alt text',
      type: 'string',
      description: 'Required for images (accessibility + SEO).',
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Alt text required';
          return true;
        }),
    }),

    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      options: {
        list: [
          { title: 'Landscape', value: 'landscape' },
          { title: 'Portrait', value: 'portrait' },
          { title: 'Square', value: 'square' },
          { title: 'Panorama', value: 'panorama' },
        ],
        layout: 'radio',
      },
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Orientation required';
          return true;
        }),
    }),

    // Optional copy
    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
    }),

    // -----------------------------------------------------------------------
    // Video fields
    // -----------------------------------------------------------------------
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: 'YouTube / Vimeo / custom URL',
      hidden: ({ document }) => (document?.type as MediaType) !== 'video',
      validation: (r) =>
        r.uri({ scheme: ['http', 'https'] }).custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'video' && !val) return 'Video URL required';
          return true;
        }),
    }),

    // -----------------------------------------------------------------------
    // Tags (references)
    // NOTE: These require schemas: country, region, travelStyle
    // -----------------------------------------------------------------------
    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
    }),

    defineField({
      name: 'regions',
      title: 'Regions',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'region' }] }],
    }),

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'travelStyle' }] }],
    }),

    // -----------------------------------------------------------------------
    // Optional attribution
    // -----------------------------------------------------------------------
    defineField({
      name: 'credit',
      title: 'Credit / Photographer',
      type: 'string',
    }),

    defineField({
      name: 'source',
      title: 'Source link',
      type: 'url',
      validation: (r) => r.uri({ scheme: ['http', 'https'] }),
    }),

    // -----------------------------------------------------------------------
    // Optional "hero" flags (useful later; harmless now)
    // -----------------------------------------------------------------------
    defineField({
      name: 'heroEnabled',
      title: 'Enable as Hero candidate',
      type: 'boolean',
      initialValue: false,
      description:
        'Optional: mark this media item as eligible for hero usage (if you ever auto-select hero slides).',
    }),

    defineField({
      name: 'heroRank',
      title: 'Hero Rank',
      type: 'number',
      description:
        'Optional: ordering value for hero selection. Lower = higher priority.',
      hidden: ({ document }) => !document?.heroEnabled,
    }),
  ],

  preview: {
    select: {
      title: 'title',
      type: 'type',
      media: 'image',
      caption: 'caption',
      alt: 'alt',
    },
    prepare({ title, type, media, caption, alt }) {
      const mainTitle = title || caption || alt || 'Media Item';
      const subtitle = type ? `Type: ${type}` : undefined;

      return {
        title: mainTitle,
        subtitle,
        media,
      };
    },
  },
});
