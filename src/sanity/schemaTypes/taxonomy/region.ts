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

import React, { type ReactElement } from 'react';
import { defineType, defineField, type PreviewValue } from 'sanity';

type UnknownRecord = Record<string, unknown>;

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
  __experimental_formPreviewTitle: true,

  // @ts-expect-error Sanity supports this, but the TS types don’t include it
  __experimental_actions: ['create', 'update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'titleRegion',
      title: 'Region / Area name',
      type: 'string',
      description: biDesc(
        'Name of the sub-area (e.g. Northern Italy, Tuscany, Cyclades, Bangkok). Naming convention: Title Case, singular, clear geographic names (avoid abbreviations).',
        'Nome della sotto-area (es. Nord Italia, Toscana, Cicladi, Bangkok). Regole: Titolo con iniziali maiuscole, singolare, nomi geografici chiari (evita abbreviazioni).',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'titleRegion',
        maxLength: 96,
      },
      // Keep URLs stable once created (avoid breaking references/links)
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      hidden: ({ document }) => !hasCountry(document),
      description: biDesc(
        'Auto-generated from the Region name. Locked after first save to keep URLs stable.',
        'Generato automaticamente dal nome della Regione. Bloccato dopo il primo salvataggio per mantenere gli URL stabili.',
      ),
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
      description: biDesc(
        'Helps disambiguate what this area represents (region vs island vs city). Leave as “Region” unless you have a good reason to change it.',
        'Aiuta a chiarire cosa rappresenta quest’area (regione vs isola vs città). Lascia “Region” salvo motivi validi per cambiarlo.',
      ),
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
      description: biDesc(
        'Parent country this region belongs to (e.g. Northern Italy → Italy). Selecting a country unlocks the rest of the fields.',
        'Paese “parent” a cui appartiene la regione (es. Nord Italia → Italia). Selezionare un Paese sblocca il resto dei campi.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Studio thumbnail (optional)                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'coverImage',
      title: 'Cover image (Studio thumbnail)',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: {
        filter: 'type == "image" && defined(image.asset)',
      },
      hidden: ({ document }) => !hasCountry(document),
      description: biDesc(
        'Optional. Picks an image from the Media library to use as a thumbnail in Studio lists/previews. This is for editorial clarity only.',
        'Opzionale. Seleziona un’immagine dalla Media library per usarla come miniatura nelle liste/anteprime dello Studio. Serve solo per chiarezza editoriale.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional metadata                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description (EN/IT)',
      type: 'object',
      hidden: ({ document }) => !hasCountry(document),
      description: biDesc(
        'Optional short intro for this area (1–3 lines). Used in listings or future region pages.',
        'Introduzione breve opzionale per quest’area (1–3 righe). Usata in liste o future pagine regione.',
      ),
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 3,
        }),
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'text',
          rows: 3,
        }),
      ],
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      hidden: ({ document }) => !hasCountry(document),
      validation: (r) => r.min(0).integer(),
      description: biDesc(
        'Optional manual ordering for curated lists. Lower values appear first.',
        'Ordinamento manuale opzionale per liste curate. Valori più bassi = prima posizione.',
      ),
    }),
  ],

  preview: {
    /**
     * Studio list / preview configuration
     *
     * IMPORTANT:
     * - Use the real editorial title field (`titleRegion`) as the preview title.
     * - Do NOT use fallbacks here: the field is required and must always exist.
     * - Use `coverImage.image` (not `->image`) to match the same pattern used
     *   in `siteSettings.ts`. This avoids preview resolution issues in Studio.
     *
     * This preview is for Studio UX only and has NO impact on the website.
     */
    select: {
      title: 'titleRegion',
      media: 'coverImage.image',
    },
    prepare(
      { title, media }: { title?: string; media?: unknown },
    ): PreviewValue {
      return {
        title: title ?? '',
        media: media as PreviewValue['media'],
      };
    },
  },
});
