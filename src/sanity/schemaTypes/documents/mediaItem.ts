// src/sanity/schemaTypes/documents/mediaItem.ts
import { defineField, defineType } from 'sanity';

type MediaType = 'image' | 'video';
type UnknownRecord = Record<string, unknown>;

/**
 * Extract `_ref` from a Sanity reference-like value.
 * We keep helpers tiny + safe because Studio callbacks are typed as `unknown`.
 */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

/** Extract `_ref`s from an array of references. */
function getRefIds(value: unknown): string[] {
  const arr = value as unknown[] | null;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => getRefId(item))
    .filter((id): id is string => Boolean(id));
}

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
      description:
        'Choose what this item is. This will show only the relevant fields below.',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    /**
     * Optional internal title:
     * Useful for you/editors to search the library quickly (not necessarily shown on site).
     */
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      description:
        'Optional. Internal label to help search (e.g. “Bangkok street food night market”).',
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
      description:
        'Upload the image file. Use high quality. Prefer original photos when possible.',
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
      description:
        'Required for images (accessibility + SEO). Describe what’s in the photo, not “image of…”.',
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
      description:
        'Helps layout choices on the website (cards, hero, galleries). Pick the closest match.',
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

    defineField({
      name: 'caption',
      title: 'Caption (optional)',
      type: 'string',
      description:
        'Optional. Short caption shown near the media (if used). Keep it short (1 line).',
    }),

    // -----------------------------------------------------------------------
    // Video fields
    // -----------------------------------------------------------------------
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description:
        'Paste a full URL (YouTube/Vimeo/etc). Example: https://www.youtube.com/watch?v=...',
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
      of: [{ type: 'reference', to: [{ type: 'country' }], weak: true }],
      description:
        'Tag the country/countries this media belongs to. ' +
        'Pick at least one if you want Regions to be selectable below.',
      validation: (r) => r.unique(),
    }),

    /**
     * Regions are “sub-areas” inside the selected countries.
     * Filter ensures you don’t accidentally tag “Tuscany” on a Thailand photo.
     */
    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],
          weak: true,
          options: {
            filter: ({ document }) => {
              const countryRefs = getRefIds(
                (document as UnknownRecord | null)?.countries,
              );

              // No countries selected → show nothing.
              if (!countryRefs.length) return { filter: 'false' };

              return {
                filter: 'country._ref in $countryRefs',
                params: { countryRefs },
              };
            },
            disableNew: false, // allow creating a missing region directly from here
          },
        },
      ],
      description:
        'Select one or more sub-areas inside the selected countries (e.g. Northern Italy, Tuscany, Cyclades). ' +
        'If a region does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
      hidden: ({ document }) =>
        getRefIds((document as UnknownRecord | null)?.countries).length === 0,
      validation: (r) => r.unique(),
    }),

    /**
     * Travel styles are editorial tags (not geography).
     * Editors can create new ones and reuse later.
     */
    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],
          weak: true,
          options: {
            disableNew: false, // allow creating from the picker
          },
        },
      ],
      description:
        'Select travel styles that match this media (e.g. Slow Travel, Digital Nomad, Sailing). ' +
        'If a travel style does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
      validation: (r) => r.unique(),
    }),

    // -----------------------------------------------------------------------
    // Optional attribution
    // -----------------------------------------------------------------------
    defineField({
      name: 'credit',
      title: 'Credit / Photographer',
      type: 'string',
      description:
        'Optional. Who shot this? (Name/brand). Leave empty for your own photos if not needed.',
    }),

    defineField({
      name: 'source',
      title: 'Source link',
      type: 'url',
      description:
        'Optional. Original source URL (only if relevant). Must be http/https.',
      validation: (r) => r.uri({ scheme: ['http', 'https'] }),
    }),

    // -----------------------------------------------------------------------
    // Optional "hero" flags (curation helpers)
    // -----------------------------------------------------------------------
    defineField({
      name: 'heroEnabled',
      title: 'Enable as Hero candidate',
      type: 'boolean',
      initialValue: false,
      description:
        'Optional. Mark this as eligible for hero usage (homepage/section headers).',
    }),

    defineField({
      name: 'heroRank',
      title: 'Hero Rank',
      type: 'number',
      description:
        'Optional. Controls curated hero ordering. Lower number = higher priority.',
      hidden: ({ document }) => !document?.heroEnabled,
      validation: (r) => r.integer().min(0),
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
