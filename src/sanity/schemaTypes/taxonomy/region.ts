// src/sanity/schemaTypes/taxonomy/region.ts
import { defineType, defineField } from 'sanity';

type UnknownRecord = Record<string, unknown>;

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

// Convert ISO-2 country code (e.g. "IT") into a flag emoji (🇮🇹)
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
      // Lock slug once it exists (prevents URL / reference churn)
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Classification (optional but helpful)                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'kind',
      title: 'Type',
      type: 'string',
      description:
        'Optional: helps disambiguate what this “region” represents (region/province/island/city).',
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
      // Lock kind once set
      readOnly: ({ document }) => Boolean(getKind(document)),
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
        'Country this region is inside (e.g. Northern Italy → Italy).',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional metadata                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Optional intro text (travel guides, listings)',
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description:
        'Optional manual ordering for curated lists (lower comes first).',
      validation: (r) => r.min(0).integer(),
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
