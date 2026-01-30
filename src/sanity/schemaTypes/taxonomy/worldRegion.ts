// src/sanity/schemaTypes/taxonomy/worldRegion.ts

import React, { type ReactElement } from 'react';
import { defineType, defineField } from 'sanity';

/**
 * World-level regions based on the World Bank classification.
 *
 * This is a **global, read-only taxonomy** used to group countries
 * at a macro level (e.g. Europe & Central Asia, East Asia & Pacific).
 *
 * Purpose:
 * - high-level geographic filtering (UI pills, navigation)
 * - grouping countries under a stable, external standard
 *
 * Editorial rules:
 * - These documents are fully seeded via scripts.
 * - Editors must NOT create, delete, or manually edit them.
 * - Any change must go through controlled seed scripts only.
 *
 * Think of this as infrastructure, not content.
 */

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

export default defineType({
  name: 'worldRegion',
  title: 'World Region (World Bank)',
  type: 'document',

  // 🔒 Lock the entire document in Studio (script-managed, read-only)
  readOnly: true,

  // Prevent create/delete in Desk UI (runtime-supported, not typed)
  // @ts-expect-error Sanity supports this at runtime
  __experimental_actions: ['update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity (seeded, immutable)                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Title (EN)',
      type: 'string',
      readOnly: true,
      description: biDesc(
        'Canonical World Bank region label (English). Seeded and immutable.',
        'Etichetta canonica della regione World Bank (inglese). Generata via script e immutabile.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'titleIt',
      title: 'Title (IT)',
      type: 'string',
      readOnly: true,
      description: biDesc(
        'Italian label used in headings or long-form UI (not compact pills). Seeded and immutable.',
        'Etichetta italiana usata in titoli o UI estese (non pillole compatte). Generata via script e immutabile.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      readOnly: true,
      options: { source: 'title', maxLength: 96 },
      description: biDesc(
        'URL-safe identifier derived from the region name. Used internally for routing and filters.',
        'Identificatore URL-safe derivato dal nome della regione. Usato internamente per routing e filtri.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      readOnly: true,
      description: biDesc(
        'Controls visual ordering in UI elements (filters, navigation). Lower values appear first.',
        'Controlla l’ordine visivo negli elementi UI (filtri, navigazione). Valori più bassi = prima posizione.',
      ),
      validation: (r) => r.integer().min(0),
    }),

    /* ---------------------------------------------------------------------- */
    /* Visual asset                                                           */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'mapImage',
      title: 'Map image (highlight)',
      type: 'image',
      readOnly: true,
      options: { hotspot: false },
      description: biDesc(
        'Seeded visual representation of this world region. Used for hero maps, region cards, and high-level navigation.',
        'Rappresentazione visiva generata via script di questa regione mondiale. Usata per mappe hero, card e navigazione di alto livello.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Internal metadata                                                       */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'string',
      readOnly: true,
      description: biDesc(
        'Optional internal notes added during seeding (debugging, provenance, data source hints). Not intended for frontend or editorial use.',
        'Note interne opzionali aggiunte durante il seeding (debug, provenienza, fonti dati). Non destinate al frontend o all’uso editoriale.',
      ),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      media: 'mapImage',
    },
    prepare({ title, media }) {
      return {
        title: title || 'World Region',
        subtitle: 'World Bank classification',
        media,
      };
    },
  },
});
