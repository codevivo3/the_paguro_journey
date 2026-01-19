// src/sanity/schemaTypes/documents/destination.ts
import { defineType, defineField } from 'sanity';

/**
 * Sanity passes `document` as `unknown` in callbacks (filter/hidden/readOnly),
 * so we keep helpers tiny + safe.
 */
type UnknownRecord = Record<string, unknown>;

/** Extracts `_ref` from a Sanity reference-like value. */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

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
      description:
        'Name of the destination (e.g. Thailand, Bangkok, Sicily, Aegean Sea). Keep it simple and recognizable.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description:
        'Auto-generated from the name. Keep it short and readable (used in the page URL).',
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
      description:
        'Select the main country for this destination. This unlocks the Regions field.',
      validation: (r) => r.required(),
    }),

    /**
     * Regions are "sub-areas" inside the selected country.
     * Editors can create new Regions on the fly (e.g. "Northern Italy") and reuse later.
     *
     * ✅ IMPORTANT: This is an array of references (not an array of objects).
     */
    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],
          weak: true, // Allows Destination publish even if Region is still draft/unpublished
          options: {
            /**
             * Filter the Region picker to ONLY show regions belonging to the selected country.
             * Prevents editors from accidentally picking regions from other countries.
             */
            filter: ({ document }) => {
              const countryRef = getRefId(
                (document as UnknownRecord | null)?.country,
              );

              // No country selected yet → show nothing.
              if (!countryRef) return { filter: 'false' };

              return {
                filter: 'country._ref == $countryRef',
                params: { countryRef },
              };
            },
            // Allow creating a missing region directly from the picker
            disableNew: false,
          },
        },
      ],
      description:
        'Select one or more sub-areas inside the selected country (e.g. Northern Italy, Tuscany, Cyclades). ' +
        'If a region does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
      hidden: ({ document }) =>
        !getRefId((document as UnknownRecord | null)?.country),
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Editorial content                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'excerpt',
      title: 'Short intro',
      type: 'text',
      rows: 3,
      description:
        '1–3 sentences used in destination cards and previews. Keep it punchy and specific.',
    }),

    defineField({
      name: 'body',
      title: 'Main content',
      type: 'array',
      of: [{ type: 'block' }],
      description:
        'Long-form destination content (guide/overview). You can leave it empty until content is ready.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Media                                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: { filter: 'type == "image"' },
      description:
        'Main visual for the destination page and cards. Choose a strong “hero” image.',
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: { filter: 'type == "image"' },
        },
      ],
      description:
        'Optional extra images for the destination page. Add only if it improves the story.',
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Travel context                                                         */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],
          weak: true, // Allows Destination publish even if Travel Style is still draft/unpublished
          options: {
            disableNew: false, // Create a style directly from here if missing
          },
        },
      ],
      description:
        'Select travel styles that match this destination (e.g. Slow Travel, Digital Nomad, Sailing). ' +
        'If a travel style does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Status & ordering                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'featured',
      title: 'Featured destination',
      type: 'boolean',
      initialValue: false,
      description:
        'Turn on to highlight this destination in curated sections (homepage, featured lists).',
    }),

    defineField({
      name: 'order',
      title: 'Manual order',
      type: 'number',
      description:
        'Optional ordering for curated lists. Lower number = shown earlier.',
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
