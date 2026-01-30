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
import { defineType, defineField } from 'sanity';

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
        source: 'title',
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
    select: {
      title: 'title',
      countryTitle: 'country.title',
      countryNameEn: 'country.nameI18n.en',
      iso: 'country.isoCode',
      kind: 'kind',
    },
    prepare({ title, countryTitle, countryNameEn, iso, kind }) {
      const flag = iso2ToFlagEmoji(iso);

      const countryLabel = countryNameEn || countryTitle;

      const parts = [
        countryLabel ? `${flag ? `${flag} ` : ''}${countryLabel}` : undefined,
        kind ? `Type: ${kind}` : undefined,
      ].filter(Boolean);

      return {
        title,
        subtitle: parts.length ? parts.join(' • ') : undefined,
      };
    },
  },
});
