// src/sanity/schemaTypes/taxonomy/country.ts
import { defineType, defineField } from 'sanity';

/**
 * Utility: Convert an ISO-2 country code (e.g. "IT", "TH")
 * into its corresponding flag emoji (🇮🇹, 🇹🇭).
 *
 * Usage notes:
 * - Used ONLY for Studio previews and visual clarity.
 * - Never rely on this for business logic or data processing.
 * - Safe fallback (🏳️) is returned for invalid or missing codes.
 */
function iso2ToFlagEmoji(iso2?: string) {
  if (!iso2) return '🏳️';

  const code = iso2.trim().toUpperCase();
  if (code.length !== 2) return '🏳️';

  // Unicode offset for Regional Indicator Symbol "A"
  const A = 0x1f1e6;
  const first = code.charCodeAt(0) - 65 + A;
  const second = code.charCodeAt(1) - 65 + A;

  // Guard against invalid characters (non A–Z)
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
        'Human-readable country name used across the site (e.g. Italy, Thailand). ' +
        'This is the primary editorial label shown to readers.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'isoCode',
      title: 'ISO-2 Code',
      type: 'string',
      description:
        'Official two-letter ISO-3166-1 alpha-2 code (e.g. IT, TH, JP). ' +
        'Used for flags, deterministic IDs, seeding scripts, and stable references. ' +
        'Must always be correct.',
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
        'URL-safe identifier derived from the ISO-2 code. ' +
        'This keeps country URLs stable and predictable over time.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'worldRegion',
      title: 'World Region (World Bank)',
      type: 'reference',
      to: [{ type: 'worldRegion' }],
      readOnly: true,
      description:
        'Automatically attached via seeding script using World Bank data. ' +
        'Not editable. Used for high-level geographic filters, navigation, and grouping.',
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
        'Optional editorial intro used in destination pages, hero sections, or SEO snippets. ' +
        'Keep it concise and reader-friendly.',
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
