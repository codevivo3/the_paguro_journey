// src/sanity/schemaTypes/documents/post.ts
import { defineType, defineField } from 'sanity';

/**
 * We keep helper typing extremely lightweight because Sanity `document`
 * is typed as `unknown` inside callbacks (filter/hidden/readOnly).
 */
type UnknownRecord = Record<string, unknown>;

/** Extracts `_ref` from a Sanity reference-like value. */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

/** Extracts a list of `_ref` from an array of reference-like values. */
function getRefIds(value: unknown): string[] {
  const arr = value as unknown[] | null;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => getRefId(item))
    .filter((id): id is string => Boolean(id));
}

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description:
        'Clear, human title. Avoid clickbait. You can refine this later.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      description:
        'Image shown on the Blog page cards (and can be reused for social previews).',
      options: {
        filter: 'type == "image"',
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      description:
        'Auto-generated from title. Keep it short and readable (used in the page URL).',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'excerpt',
      title: 'Excerpt (short summary)',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences. Used in previews, cards, and social sharing.',
      validation: (r) => r.max(200),
    }),

    /* ---------------------------------------------------------------------- */
    /* Content                                                                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        {
          type: 'block',
          // Keep Callout as a "style" in the same dropdown where H2/H3/Quote live
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },

        // Media blocks (reuse Media bucket)
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
        },

        // Callout blocks (styled boxes in the article)
        {
          name: 'callout',
          title: 'Callout',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Optional heading shown at the top of the callout box.',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: 'title', body: 'body' },
            prepare({ title }) {
              return {
                title: title || 'Callout',
                subtitle: 'Callout box',
              };
            },
          },
        },
      ],
      description:
        'Main article body. You can add text blocks and reusable media items.',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Meta                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description:
        'Optional. If empty, the website can fall back to “last updated”.',
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
      description:
        'Draft = not live. Published = visible on the website (depending on your frontend logic).',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Relations (used for filtering, discovery, and grouping)                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
      description:
        'Select one or more countries this post relates to. (Choose first — it unlocks Regions.)',
      validation: (r) => r.unique(),
    }),

    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],

          /**
           * `weak: true` allows publishing the Post even if a referenced Region
           * is still a draft/unpublished doc. Useful for “create now, refine later”.
           */
          weak: true,

          options: {
            /**
             * Filter regions to only those that belong to the selected countries.
             * Prevents messy cross-country regions appearing in the picker.
             */
            filter: ({ document }) => {
              const countryRefs = getRefIds(
                (document as UnknownRecord | null)?.countries,
              );

              // When no countries are selected, show nothing (avoids confusion).
              if (!countryRefs.length) return { filter: 'false' };

              return {
                filter: 'country._ref in $countryRefs',
                params: { countryRefs },
              };
            },

            /**
             * Keep this false so editors can create regions on the fly
             * (e.g. "Northern Italy") and reuse them later.
             */
            disableNew: false,
          },
        },
      ],
      description:
        'Select one or more regions inside the chosen countries (e.g. Northern Italy, Tuscany, Cyclades). ' +
        'If a region does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
      hidden: ({ document }) =>
        getRefIds((document as UnknownRecord | null)?.countries).length === 0,
      validation: (r) => r.unique(),
    }),

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],

          /**
           * Same logic as Regions:
           * allow draft/unpublished styles while still publishing the post.
           */
          weak: true,

          options: {
            // Let editors create styles from inside the Post editor
            disableNew: false,
          },
        },
      ],
      description:
        'Select one or more travel styles that describe this post (e.g. Slow Travel, Digital Nomad, Sailing). ' +
        'If a travel style does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
      validation: (r) => r.unique(),
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
            ? `Published · ${
                publishedAt ? new Date(publishedAt).toLocaleDateString() : ''
              }`
            : 'Draft',
      };
    },
  },
});
