// src/sanity/schemaTypes/documents/destination.ts
import React from 'react';
import { defineType, defineField } from 'sanity';

/**
 * Sanity passes `document` as `unknown` in callbacks (filter/hidden/readOnly),
 * so we keep helpers tiny + safe.
 */
type UnknownRecord = Record<string, unknown>;

/**
 * Bilingual field description for Sanity Studio.
 * Sanity supports `string | Element` for `description`.
 * We use `React.createElement` (no JSX) so this file can stay `.ts`.
 */
function biDesc(en: string, it: string) {
  return React.createElement(
    'span',
    null,
    React.createElement('strong', null, 'EN'),
    ' — ',
    en,
    React.createElement('br'),
    React.createElement('br'),
    React.createElement('strong', null, 'IT'),
    ' — ',
    it,
  );
}

/** Extracts `_ref` from a Sanity reference-like value. */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

export default defineType({
  name: 'destination',
  title: 'Destination',
  type: 'document',
  description: biDesc(
    'A destination page (country / city / region) that powers the Destinations index, destination detail pages, and cross-linking from posts. Use this to organize travel content and attach consistent media + tags.',
    'Una pagina destinazione (paese / città / regione) che alimenta l’indice Destinazioni, le pagine dettaglio e i collegamenti dai post. Usala per organizzare i contenuti di viaggio e associare media + tag in modo coerente.',
  ),

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core identity                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Destination name',
      type: 'string',
      description: biDesc(
        'Name of the destination (e.g. Thailand, Bangkok, Sicily, Aegean Sea). Keep it simple and recognizable.',
        'Nome della destinazione (es. Thailandia, Bangkok, Sicilia, Mar Egeo). Semplice e riconoscibile.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      description: biDesc(
        'Auto-generated from the name. Keep it short and readable (used in the page URL).',
        'Generato automaticamente dal nome. Mantienilo corto e leggibile (usato nell\'URL della pagina).',
      ),
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Geography                                                              */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'country',
      title: 'Country',
      type: 'reference',
      to: [{ type: 'country' }],
      description: biDesc(
        'Select the main country for this destination. This unlocks the Regions field.',
        'Seleziona il paese principale per questa destinazione. Questo abilita il campo Regioni.',
      ),
      validation: (r) => r.required(),
    }),

    /**
     * Regions are "sub-areas" inside the selected country.
     * Editors can create new Regions on the fly (e.g. "Northern Italy") and reuse later.
     *
     * ✅ IMPORTANT: This is an array of references (not an array of objects).
     */
    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],
          weak: true, // Allows Destination publish even if Region is still draft/unpublished
          options: {
            /**
             * Filter the Region picker to ONLY show regions belonging to the selected country.
             * Prevents editors from accidentally picking regions from other countries.
             */
            filter: ({ document }) => {
              const countryRef = getRefId(
                (document as UnknownRecord | null)?.country,
              );

              // No country selected yet → show nothing.
              if (!countryRef) return { filter: 'false' };

              return {
                filter: 'country._ref == $countryRef',
                params: { countryRef },
              };
            },
            // Allow creating a missing region directly from the picker
            disableNew: false,
          },
        },
      ],
      description: biDesc(
        'Select one or more sub-areas inside the selected country (e.g. Northern Italy, Tuscany, Cyclades). If a region does not exist yet, you can create it directly from here. Naming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
        'Seleziona una o più sotto-aree del paese scelto (es. Italia del Nord, Toscana, Cicladi). Se una regione non esiste ancora, puoi crearla direttamente da qui. Convenzione nomi: Iniziali Maiuscole, singolare, nomi geografici chiari (evita abbreviazioni o di ripetere il nome del paese).',
      ),
      hidden: ({ document }) =>
        !getRefId((document as UnknownRecord | null)?.country),
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Editorial content                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'excerpt',
      title: 'Short intro',
      type: 'text',
      rows: 3,
      description: biDesc(
        '1–3 sentences used in destination cards and previews. Keep it punchy and specific.',
        '1–3 frasi usate nelle card e anteprime. Sintetico e specifico.',
      ),
    }),

    defineField({
      name: 'body',
      title: 'Main content',
      type: 'array',
      of: [{ type: 'block' }],
      description: biDesc(
        'Long-form destination content (guide/overview). You can leave it empty until content is ready.',
        'Contenuto lungo (guida/panoramica). Puoi lasciarlo vuoto finché il contenuto non è pronto.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Media                                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: { filter: 'type == "image"' },
      description: biDesc(
        'Main visual for the destination page and cards. Choose a strong “hero” image.',
        'Immagine principale per la pagina e le card. Scegli una “hero” forte.',
      ),
    }),

    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: { filter: 'type == "image"' },
        },
      ],
      description: biDesc(
        'Optional extra images for the destination page. Add only if it improves the story.',
        'Immagini extra opzionali. Aggiungile solo se migliorano la storia.',
      ),
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Travel context                                                         */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],
          weak: true, // Allows Destination publish even if Travel Style is still draft/unpublished
          options: {
            disableNew: false, // Create a style directly from here if missing
          },
        },
      ],
      description: biDesc(
        'Select travel styles that match this destination (e.g. Slow Travel, Digital Nomad, Sailing). If a travel style does not exist yet, you can create it directly from here. Naming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
        'Seleziona gli stili di viaggio che descrivono questa destinazione (es. Slow Travel, Digital Nomad, Vela). Se uno stile non esiste, puoi crearlo direttamente da qui. Convenzione nomi: Iniziali Maiuscole, singolare, termini descrittivi (evita abbreviazioni o etichette troppo generiche).',
      ),
      validation: (r) => r.unique(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Status & ordering                                                      */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'featured',
      title: 'Featured destination',
      type: 'boolean',
      initialValue: false,
      description: biDesc(
        'Turn on to highlight this destination in curated sections (homepage, featured lists).',
        'Attiva per mettere in evidenza questa destinazione in sezioni curate (home, liste in evidenza).',
      ),
    }),

    defineField({
      name: 'order',
      title: 'Manual order',
      type: 'number',
      description: biDesc(
        'Optional ordering for curated lists. Lower number = shown earlier.',
        'Ordinamento opzionale per liste curate. Numero più basso = prima in lista.',
      ),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      country: 'country.title',
      media: 'coverImage.image',
    },
    prepare({ title, country, media }) {
      return {
        title,
        subtitle: country ? `Country: ${country}` : undefined,
        media,
      };
    },
  },
});
