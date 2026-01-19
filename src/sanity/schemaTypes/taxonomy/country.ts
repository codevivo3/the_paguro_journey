// src/sanity/schemaTypes/taxonomy/country.ts
import { defineType, defineField } from 'sanity';

/**
 * Utility: Convert an ISO-2 country code (e.g. "IT", "TH")
 * into its corresponding flag emoji (🇮🇹, 🇹🇭).
 *
 * Used ONLY for Studio previews and visual clarity.
 * No business logic should rely on this.
 */
function iso2ToFlagEmoji(iso2?: string) {
  if (!iso2) return '🏳️';
  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return '🏳️';

  const A = 0x1f1e6; // Unicode offset for Regional Indicator Symbol "A"
  const first = code.charCodeAt(0) - 65 + A;
  const second = code.charCodeAt(1) - 65 + A;

  // Guard against invalid characters
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
      description:
        'Human-readable country name used across the site (e.g. Italy, Thailand).',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'isoCode',
      title: 'ISO-2 Code',
      type: 'string',
      description:
        'Official two-letter ISO-3166-1 alpha-2 code (e.g. IT, TH, JP). Used for flags, seeding, and stable references.',
      validation: (r) =>
        r
          .required()
          .length(2)
          .regex(/^[A-Za-z]{2}$/, {
            name: 'ISO-2',
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
      description:
        'URL-safe identifier derived from the ISO-2 code. Keeps URLs stable and predictable.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'worldRegion',
      title: 'World Region (World Bank)',
      type: 'reference',
      to: [{ type: 'worldRegion' }],
      readOnly: true,
      description:
        'Automatically attached via seeding script based on World Bank data. Used for high-level geographic filters and navigation.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional editorial metadata                                            */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description:
        'Optional editorial intro shown on destination pages, hero sections, or SEO snippets.',
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
