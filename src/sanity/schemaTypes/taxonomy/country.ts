// src/sanity/schemaTypes/taxonomy/country.ts
import { defineType, defineField } from 'sanity';

// Convert ISO-2 country code to flag emoji (e.g. "TH" → 🇹🇭)
function iso2ToFlagEmoji(iso2?: string) {
  if (!iso2) return '🏳️';
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return '🏳️';

  const A = 0x1f1e6; // Regional Indicator Symbol Letter A
  const first = code.charCodeAt(0) - 65 + A;
  const second = code.charCodeAt(1) - 65 + A;

  if (
    code.charCodeAt(0) < 65 ||
    code.charCodeAt(0) > 90 ||
    code.charCodeAt(1) < 65 ||
    code.charCodeAt(1) > 90
  ) {
    return '🏳️';
  }

  return String.fromCodePoint(first, second);
}

export default defineType({
  name: 'country',
  title: 'Country',
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Country name',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'isoCode',
      title: 'ISO‑2 Code',
      type: 'string',
      description: 'Two‑letter ISO code (e.g. IT, TH, JP)',
      validation: (r) =>
        r
          .required()
          .length(2)
          .regex(/^[A-Za-z]{2}$/, {
            name: 'ISO‑2',
            invert: false,
          }),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'isoCode',
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'worldRegion',
      title: 'World Region (World Bank)',
      type: 'reference',
      to: [{ type: 'worldRegion' }],
      description:
        'Seeded from World Bank regions. Used for the top-level pills.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional editorial metadata                                            */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: 'Optional intro text (travel guides, hero sections)',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      iso: 'isoCode',
      worldRegion: 'worldRegion.title',
    },
    prepare({ title, iso, worldRegion }) {
      const flag = iso2ToFlagEmoji(iso);
      const parts = [
        iso ? `ISO: ${iso}` : null,
        worldRegion ? `WB: ${worldRegion}` : null,
      ].filter(Boolean);

      return {
        title: `${flag} ${title}`,
        subtitle: parts.length ? parts.join(' • ') : undefined,
      };
    },
  },
});
