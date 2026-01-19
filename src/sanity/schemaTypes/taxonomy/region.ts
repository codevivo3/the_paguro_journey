// src/sanity/schemaTypes/taxonomy/region.ts

/**
 * Schema defining a Region as a sub-national area tied to a specific country.
 * This represents an editorial taxonomy used to organize content geographically
 * within a country, not to be confused with global or continental regions.
 */

import { defineType, defineField } from 'sanity';

type UnknownRecord = Record<string, unknown>;

/**
 * Defensive helper functions for Sanity Studio typing and safe access.
 * These ensure we safely extract nested properties without runtime errors.
 */
function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = (doc?.['slug'] as UnknownRecord | undefined) ?? undefined;
  return slug?.['current'] as string | undefined;
}

function getKind(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  return doc?.['kind'] as string | undefined;
}

function getCountryRef(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const country = (doc?.['country'] as UnknownRecord | undefined) ?? undefined;
  return country?.['_ref'] as string | undefined;
}

/**
 * Convert ISO-2 country code (e.g. "IT") into a flag emoji (🇮🇹).
 * This is used only for Studio preview display purposes.
 */
function iso2ToFlagEmoji(iso2?: string): string {
  if (!iso2) return '';
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return '';
  const A = 0x41;
  const FLAG_OFFSET = 0x1f1e6;

  const c1 = code.charCodeAt(0);
  const c2 = code.charCodeAt(1);
  if (c1 < A || c1 > A + 25 || c2 < A || c2 > A + 25) return '';

  return String.fromCodePoint(FLAG_OFFSET + (c1 - A), FLAG_OFFSET + (c2 - A));
}

/**
 * Used to progressively reveal fields in the editor once a country is selected.
 */
function hasCountry(document: unknown): boolean {
  return Boolean(getCountryRef(document));
}

export default defineType({
  name: 'region',
  title: 'Region',
  type: 'document',

  // @ts-expect-error Sanity supports this, but the TS types don’t include it
  __experimental_actions: ['create', 'update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Region / Area name',
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
      // Lock slug after first creation to ensure URL stability and avoid breaking links
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      hidden: ({ document }) => !hasCountry(document),
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Editorial disambiguation and classification (optional but helpful)    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Region', value: 'region' },
          { title: 'Province / State', value: 'province' },
          { title: 'Island', value: 'island' },
          { title: 'City', value: 'city' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio',
      },
      initialValue: 'region',
      readOnly: ({ document }) => Boolean(getKind(document)),
      hidden: ({ document }) => !hasCountry(document),
    }),

    /* ---------------------------------------------------------------------- */
    /* Parent relationship                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'country',
      title: 'Country (parent)',
      type: 'reference',
      to: [{ type: 'country' }],
      // Lock country once set
      readOnly: ({ document }) => Boolean(getCountryRef(document)),
      validation: (r) => r.required(),
      description:
        'Parent country this region belongs to (e.g. Northern Italy → Italy). Selecting this unlocks the rest of the fields.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional metadata and ordering for editorial UX                        */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      hidden: ({ document }) => !hasCountry(document),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: ({ document }) => !hasCountry(document),
      validation: (r) => r.min(0).integer(),
      description: 'Manual ordering index used in UI lists (lower values appear first).',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      country: 'country.title',
      iso: 'country.isoCode',
      kind: 'kind',
    },
    prepare({ title, country, iso, kind }) {
      const flag = iso2ToFlagEmoji(iso);
      const parts = [
        country ? `${flag ? `${flag} ` : ''}${country}` : undefined,
        kind ? `Kind: ${kind}` : undefined,
      ].filter(Boolean);

      return {
        title,
        subtitle: parts.length ? parts.join(' • ') : undefined,
      };
    },
  },
});
