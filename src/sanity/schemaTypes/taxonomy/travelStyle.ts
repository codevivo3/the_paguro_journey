// src/sanity/schemaTypes/taxonomy/travelStyle.ts

/**
 * Travel Style taxonomy.
 *
 * Used to describe *how* a destination or post is experienced,
 * not *where* it is.
 *
 * Examples:
 * - Slow Travel
 * - Digital Nomad
 * - Sailing
 * - Backpacking
 *
 * Editorial rule:
 * - Travel Styles are created organically by editors when needed.
 * - They are reused across Posts, Destinations, and Media.
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
 * Helper to detect whether a slug already exists.
 * Used to lock the slug after first creation to keep URLs stable.
 */
function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = (doc?.['slug'] as UnknownRecord | undefined) ?? undefined;
  return slug?.['current'] as string | undefined;
}

export default defineType({
  name: 'travelStyle',
  title: 'Travel Style',
  type: 'document',

  // Allow create/update/publish, but intentionally no delete
  // (prevents breaking references across content)
  // @ts-expect-error Sanity supports this at runtime
  __experimental_actions: ['create', 'update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'titleI18n',
      title: 'Travel style name (IT/EN)',
      type: 'object',
      description: biDesc(
        'Human-readable label used in filters, cards, and UI elements. Naming convention: Title Case, singular, descriptive terms (avoid abbreviations and overly generic labels).',
        'Etichetta leggibile usata in filtri, card e UI. Regole: Titolo con iniziali maiuscole, singolare, termini descrittivi (evita abbreviazioni ed etichette troppo generiche).',
      ),
      fields: [
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'string',
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'subtitleI18n',
      title: 'Travel style subtitle (IT/EN)',
      type: 'object',
      description: biDesc(
        'Optional short subtitle/tagline shown in UI (e.g. “Work remotely on the move”). Keep it concise.',
        'Sottotitolo/tagline opzionale mostrato nella UI (es. “Lavoro remoto in viaggio”). Tienilo conciso.',
      ),
      fields: [
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'string',
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
        }),
      ],
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: (doc: UnknownRecord | undefined) => {
          const t = (doc?.['titleI18n'] as UnknownRecord | undefined) ?? undefined;
          const it = (t?.['it'] as string | undefined) ?? undefined;
          const en = (t?.['en'] as string | undefined) ?? undefined;
          return it || en || '';
        },
        maxLength: 96,
      },
      // Lock slug after first save to avoid URL churn
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      description: biDesc(
        'Auto-generated from the Travel Style name. Locked after creation to keep URLs stable.',
        'Generato automaticamente dal nome dello stile. Bloccato dopo la creazione per mantenere gli URL stabili.',
      ),
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Optional editorial context                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'description',
      title: 'Short description (EN/IT)',
      type: 'object',
      description: biDesc(
        'Optional short explanation of this travel style. Used for UI tooltips, filters, or future landing pages.',
        'Spiegazione breve opzionale di questo stile di viaggio. Usata per tooltip UI, filtri o future pagine dedicate.',
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
      name: 'contentI18n',
      title: 'Content (IT/EN)',
      type: 'object',
      description: biDesc(
        'Optional long-form content for this travel style. Useful for tooltips, landing pages, or richer UI in the future.',
        'Contenuto lungo opzionale per questo stile di viaggio. Utile per tooltip, pagine dedicate o UI più ricche in futuro.',
      ),
      fields: [
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'array',
          of: [
            { type: 'block' },
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  title: 'Alt text (accessibility)',
                  type: 'string',
                  description: 'Short description for screen readers.',
                },
                {
                  name: 'caption',
                  title: 'Caption (optional)',
                  type: 'string',
                },
              ],
            },
          ],
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: [
            { type: 'block' },
            {
              type: 'image',
              options: { hotspot: true },
              fields: [
                {
                  name: 'alt',
                  title: 'Alt text (accessibility)',
                  type: 'string',
                  description: 'Short description for screen readers.',
                },
                {
                  name: 'caption',
                  title: 'Caption (optional)',
                  type: 'string',
                },
              ],
            },
          ],
        }),
      ],
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: biDesc(
        'Optional manual ordering for dropdowns or curated lists. Lower values appear first.',
        'Ordinamento manuale opzionale per menu a tendina o liste curate. Valori più bassi = prima posizione.',
      ),
      validation: (r) => r.min(0).integer(),
    }),
  ],

  preview: {
    select: {
      titleIt: 'titleI18n.it',
      titleEn: 'titleI18n.en',
      subIt: 'subtitleI18n.it',
      subEn: 'subtitleI18n.en',
    },
    prepare({ titleIt, titleEn, subIt, subEn }) {
      const title = (titleIt || titleEn || 'Travel Style') as string;
      const sub = (subIt || subEn || '') as string;
      return {
        title,
        subtitle: sub ? `Taxonomy · ${sub}` : 'Taxonomy',
      };
    },
  },
});
