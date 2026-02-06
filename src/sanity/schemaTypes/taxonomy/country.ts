// src/sanity/schemaTypes/taxonomy/country.ts
import React, { type ReactElement } from 'react';
import { defineType, defineField, PatchEvent, set, useFormValue, type StringInputProps } from 'sanity';

/**
 * Bilingual descriptions (EN + IT) for Studio fields.
 * English first, Italian second.
 */
function biDesc(en: string, it: string): ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { style: { marginBottom: '0.5rem' } },
      React.createElement('strong', null, 'EN'),
      ' — ',
      en,
    ),
    React.createElement(
      'div',
      null,
      React.createElement('strong', null, 'IT'),
      ' — ',
      it,
    ),
  );
}

/**
 * Country schema represents a standardized set of country data used across the site.
 * It primarily serves as a foundational taxonomy for Destinations cards,
 * providing consistent country names, ISO codes, and regional metadata.
 * 
 * This schema enables editorial control over country-related content,
 * including optional descriptive text and cover images for visual presentation.
 */

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

/**
 * Studio-only helper: derive localized country names from an ISO-2 code.
 * Uses CLDR data via Intl.DisplayNames (free, no API calls).
 */
function countryNameFromIso2(iso2: string, locale: 'en' | 'it') {
  try {
    const code = (iso2 ?? '').trim().toUpperCase();
    if (code.length !== 2) return undefined;
    // Intl.DisplayNames expects an ISO 3166-1 alpha-2 region code.
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Custom input for ISO-2 Code:
 * - Lets editors type the ISO code normally.
 * - If `nameI18n.en` and/or `nameI18n.it` are empty, auto-fills them from the ISO code.
 * - Never overwrites existing editor-provided values.
 */
function Iso2CodeInput(props: StringInputProps) {
  const nameI18n = useFormValue(['nameI18n']) as { en?: string; it?: string } | undefined;

  const elementProps = props.elementProps ?? ({} as NonNullable<StringInputProps['elementProps']>);
  const originalOnChange = elementProps.onChange;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Let the default input update the isoCode field
    originalOnChange?.(e);

    const nextIso = String(e?.currentTarget?.value ?? '');
    const en = countryNameFromIso2(nextIso, 'en');
    const it = countryNameFromIso2(nextIso, 'it');

    const patches: Array<ReturnType<typeof set>> = [];

    // Fill ONLY when empty (do not overwrite)
    const hasEn = Boolean((nameI18n?.en ?? '').trim());
    const hasIt = Boolean((nameI18n?.it ?? '').trim());

    if (!hasEn && en) patches.push(set(en, ['nameI18n', 'en']));
    if (!hasIt && it) patches.push(set(it, ['nameI18n', 'it']));

    if (patches.length) {
      // Avoid tuple-spread typing issues by emitting patch events one-by-one.
      // Sanity will apply them in order.
      for (const p of patches) {
        props.onChange(PatchEvent.from(p));
      }
    }
  };

  // Render the default Sanity string input, but inject our onChange
  return props.renderDefault({
    ...props,
    elementProps: {
      ...elementProps,
      onChange,
    },
  });
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
      description: biDesc(
        'Internal label for editors (Studio search). Keep it in English for consistency. The website should use “Country display name (EN/IT)” instead.',
        'Etichetta interna per gli editor (ricerca in Studio). Tienila in inglese per coerenza. Il sito dovrebbe usare “Country display name (EN/IT)”.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'nameI18n',
      title: 'Country display name (EN/IT)',
      type: 'object',
      description: biDesc(
        'Public-facing country name used on the website. The UI can switch between EN and IT based on site language.',
        'Nome del Paese mostrato sul sito. La UI può passare tra EN e IT in base alla lingua del sito.',
      ),
      fields: [
        defineField({
          name: 'en',
          title: 'English (required)',
          type: 'string',
          description: biDesc(
            'Country name in English (e.g. Italy, Thailand).',
            'Nome del Paese in inglese (es. Italy, Thailand).',
          ),
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'it',
          title: 'Italiano (optional)',
          type: 'string',
          description: biDesc(
            'Country name in Italian (e.g. Italia, Thailandia). Leave empty if you do not localize countries yet.',
            'Nome del Paese in italiano (es. Italia, Thailandia). Lascia vuoto se non localizzi ancora i Paesi.',
          ),
        }),
      ],
    }),

    defineField({
      name: 'isoCode',
      title: 'ISO-2 Code',
      type: 'string',
      components: {
        input: Iso2CodeInput,
      },
      description: biDesc(
        'Official two-letter ISO‑3166‑1 alpha‑2 code (e.g. IT, TH, JP). Used for flags, stable IDs, seeding scripts, and references. Must always be correct.',
        'Codice ufficiale ISO‑3166‑1 alpha‑2 a due lettere (es. IT, TH, JP). Usato per bandiere, ID stabili, script di seeding e riferimenti. Deve essere sempre corretto.',
      ),
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
      description: biDesc(
        'URL-safe identifier derived from the ISO‑2 code. Keeps country URLs stable and predictable over time.',
        'Identificatore URL-safe derivato dal codice ISO‑2. Mantiene gli URL dei Paesi stabili e prevedibili nel tempo.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'worldRegion',
      title: 'World Region (World Bank)',
      type: 'reference',
      to: [{ type: 'worldRegion' }],
      readOnly: true,
      options: {
        disableNew: true,
      },
      description: biDesc(
        'Automatically attached via seeding script using World Bank data. Not editable. Used for geographic grouping and filters.',
        'Associato automaticamente tramite script di seeding usando dati World Bank. Non modificabile. Usato per raggruppamenti e filtri geografici.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional editorial metadata                                            */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description',
      type: 'text',
      rows: 3,
      description: biDesc(
        'Optional editorial intro used in destination pages, hero sections, or SEO snippets. Keep it concise and reader‑friendly.',
        'Introduzione editoriale opzionale usata nelle pagine destinazione, hero o snippet SEO. Mantienila concisa e leggibile.',
      ),
    }),

    // Optional cover image for Destination cards.
    // This field takes precedence over the auto-derived cover image
    // (which is typically the latest related blog card image).
    // Editors can override the default visual presentation by setting this explicitly.
    defineField({
      name: 'destinationCover',
      title: 'Destination card cover',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: { filter: 'type == "image"' },
      description: biDesc(
        'Optional. Overrides the auto cover used on Destination cards. If empty, the latest related blog card image is used.',
        'Opzionale. Sovrascrive l’immagine di copertina automatica delle card Destinazione. Se vuoto, viene usata l’ultima immagine del blog correlato.',
      ),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      nameEn: 'nameI18n.en',
      iso: 'isoCode',
      worldRegion: 'worldRegion.title',
    },
    prepare({ title, nameEn, iso, worldRegion }) {
      const flag = iso2ToFlagEmoji(iso);

      const parts = [
        iso ? `ISO: ${iso}` : null,
        worldRegion ? `WB: ${worldRegion}` : null,
      ].filter(Boolean);

      return {
        title: nameEn || title,
        subtitle: parts.length ? parts.join(' • ') : undefined,
        // Use the flag emoji as the Studio list thumbnail.
        // Sanity accepts a ReactElement here.
        media: React.createElement(
          'span',
          {
            style: {
              display: 'inline-flex',
              width: '100%',
              height: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              lineHeight: 1,
            },
            'aria-label': iso ? `Flag ${iso}` : 'Flag',
          },
          flag,
        ),
      };
    },
  },
});
