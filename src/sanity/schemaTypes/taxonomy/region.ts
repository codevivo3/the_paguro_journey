// src/sanity/schemaTypes/taxonomy/region.ts

/**
 * Region taxonomy (sub-areas inside a country).
 *
 * Think: "Northern Italy", "Tuscany", "Cyclades", "Bangkok".
 * This is NOT a global region system (that's handled by worldRegion).
 *
 * Editorial rule:
 * - Regions are created by editors as needed from Post/Destination pickers.
 * - Each Region must belong to exactly one Country.
 */

import { defineType, defineField } from 'sanity';

type UnknownRecord = Record<string, unknown>;

/**
 * Defensive helpers:
 * Sanity passes `document` as `unknown` in callbacks, so we safely read nested fields.
 * These helpers prevent runtime crashes and keep TypeScript happy.
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
 * Used ONLY for Studio previews (visual clarity), never for logic.
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
 * Editor UX:
 * We hide some fields until the parent Country is chosen.
 * This prevents creating "floating" regions with no country.
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
      description:
        'Name of the sub-area (e.g. Northern Italy, Tuscany, Cyclades, Bangkok). ' +
        'Naming convention: use Title Case, singular, and clear geographic names (avoid abbreviations).',
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
      // Keep URLs stable once created (avoid breaking references/links)
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      hidden: ({ document }) => !hasCountry(document),
      description:
        'Auto-generated from the Region name. Locked after first save to keep URLs stable.',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Classification (optional but useful)                                   */
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
      description:
        'Helps disambiguate what this area represents (region vs island vs city). ' +
        'Leave as "Region" unless you have a good reason to change it.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Parent relationship (required)                                         */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'country',
      title: 'Country (parent)',
      type: 'reference',
      to: [{ type: 'country' }],
      // Prevent accidental "moving" of a region to another country
      readOnly: ({ document }) => Boolean(getCountryRef(document)),
      validation: (r) => r.required(),
      description:
        'Parent country this region belongs to (e.g. Northern Italy → Italy). ' +
        'Selecting a country unlocks the rest of the fields.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional metadata                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      hidden: ({ document }) => !hasCountry(document),
      description:
        'Optional short intro for this area (1–3 lines). Useful for listings or future region pages.',
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: ({ document }) => !hasCountry(document),
      validation: (r) => r.min(0).integer(),
      description:
        'Optional manual ordering for curated lists. Lower values appear first.',
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
        kind ? `Type: ${kind}` : undefined,
      ].filter(Boolean);

      return {
        title,
        subtitle: parts.length ? parts.join(' • ') : undefined,
      };
    },
  },
});
