// src/sanity/schemaTypes/documents/mediaItem.ts
import React, { type ReactElement } from 'react';
import { defineField, defineType } from 'sanity';

type MediaType = 'image' | 'video';
type UnknownRecord = Record<string, unknown>;

/**
 * Bilingual descriptions (EN + IT) for Studio fields.
 * Keep English first (portfolio-friendly), Italian second (editor-friendly).
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
 * Extract `_ref` from a Sanity reference-like value.
 * We keep helpers tiny + safe because Studio callbacks are typed as `unknown`.
 */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

/** Extract `_ref`s from an array of references. */
function getRefIds(value: unknown): string[] {
  const arr = value as unknown[] | null;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => getRefId(item))
    .filter((id): id is string => Boolean(id));
}

export default defineType({
  name: 'mediaItem',
  title: 'Media Item',
  type: 'document',

  description: biDesc(
    'Single source of truth for ALL media (images + videos). Use this library to upload, tag, and reuse assets across the site (hero slides, gallery, break images, posts, destinations). Keep titles internal, alt text accurate, and tags consistent so search + filters work reliably.',
    'Fonte unica per TUTTI i media (immagini + video). Usa questa libreria per caricare, taggare e riutilizzare gli asset nel sito (hero, galleria, break images, post, destinazioni). Mantieni i titoli interni, l’alt accurato e i tag coerenti così ricerca e filtri funzionano bene.',
  ),

  fields: [
    // -----------------------------------------------------------------------
    // Core switch: image vs video
    // -----------------------------------------------------------------------
    /**
     * Optional internal title:
     * Useful for you/editors to search the library quickly (not necessarily shown on site).
     */
    defineField({
      name: 'title',
      title: 'Title (internal)',
      type: 'string',
      description: biDesc(
        'Optional. Internal label to help search (e.g. “Bangkok street food night market”).',
        'Opzionale. Etichetta interna per aiutare la ricerca (es. “Bangkok street food night market”).',
      ),
    }),

    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      description: biDesc(
        'Choose what this item is. This will show only the relevant fields below.',
        'Scegli cosa rappresenta questo elemento. Mostrerà solo i campi rilevanti qui sotto.',
      ),
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Video', value: 'video' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    // -----------------------------------------------------------------------
    // Image fields
    // -----------------------------------------------------------------------
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      description: biDesc(
        'Upload the image file. Use high quality. Prefer original photos when possible.',
        'Carica il file immagine. Usa alta qualità. Preferisci foto originali quando possibile.',
      ),
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Image required';
          return true;
        }),
    }),

    defineField({
      name: 'orientation',
      title: 'Orientation',
      type: 'string',
      description: biDesc(
        'Helps layout choices on the website (cards, hero, galleries). Pick the closest match.',
        'Aiuta le scelte di layout sul sito (card, hero, gallerie). Scegli l’opzione più vicina.',
      ),
      options: {
        list: [
          { title: 'Landscape', value: 'landscape' },
          { title: 'Portrait', value: 'portrait' },
          { title: 'Square', value: 'square' },
          { title: 'Panorama', value: 'panorama' },
        ],
        layout: 'radio',
      },
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Orientation required';
          return true;
        }),
    }),

    defineField({
      name: 'alt',
      title: 'Alt text (EN — SEO)',
      type: 'string',
      description: biDesc(
        'Required for images (SEO + accessibility). Write in ENGLISH only. Describe what’s in the photo, not “image of…”. This is the ONLY alt used for SEO.',
        'Obbligatorio per le immagini (SEO + accessibilità). Scrivi SOLO in INGLESE. Descrivi cosa c’è nella foto, non “immagine di…”. Questo è l’UNICO alt usato per SEO.',
      ),
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      validation: (r) =>
        r.custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'image' && !val) return 'Alt text required';
          return true;
        }),
    }),

    defineField({
      name: 'captionI18n',
      title: 'Caption (EN/IT)',
      type: 'object',
      description: biDesc(
        'Optional. Use this when you want captions to switch by site language.',
        'Opzionale. Usa questo campo quando vuoi che le didascalie cambino in base alla lingua del sito.',
      ),
      fields: [
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'string',
          description: 'Didascalia breve (IT).',
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
          description: 'Caption text in English.',
        }),
      ],
    }),

    defineField({
      name: 'altI18n',
      title: 'Description for Screen Readers — EN/IT',
      type: 'object',
      description: biDesc(
        'Accessibility-only alternative text for screen readers. NOT used for SEO. The site may switch this by language.',
        'Testo alternativo SOLO per screen reader. NON usato per SEO. Il sito può cambiarlo in base alla lingua.',
      ),
      hidden: ({ document }) => (document?.type as MediaType) !== 'image',
      fields: [
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'string',
          description: 'Descrivi nel dettagio cosa c’è nella foto (IT).',
        }),
        defineField({
          name: 'en',
          title: 'English',
          type: 'string',
          description: 'Detailed description about what’s in the photo (EN).',
        }),
      ],
    }),

    // -----------------------------------------------------------------------
    // Gallery visibility
    // -----------------------------------------------------------------------
    /**
     * Gallery visibility switch.
     *
     * Purpose:
     * - Controls whether this image appears in the public Gallery page.
     * - Used ONLY by the Gallery GROQ query (filtered at source).
     *
     * Typical use cases (set to TRUE):
     * - About page images
     * - Cover / hero images
     * - UI / structural visuals
     *
     * Leave OFF for real travel photography.
     *
     * ⚠️ Important:
     * This is an editorial decision, not inferred automatically.
     * We intentionally avoid guessing based on usage or title.
     */
    defineField({
      name: 'excludeFromGallery',
      title: 'Exclude from Gallery',
      type: 'boolean',
      initialValue: false,
      description: biDesc(
        'Turn this on for images that should NOT appear in the public gallery (e.g. About image, cover images).',
        'Attiva questo per immagini che NON devono comparire nella galleria pubblica (es. About, cover, immagini strutturali).',
      ),
    }),

    // -----------------------------------------------------------------------
    // Video fields
    // -----------------------------------------------------------------------
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
      description: biDesc(
        'Paste a full URL (YouTube/Vimeo/etc). Example: https://www.youtube.com/watch?v=...',
        'Incolla un URL completo (YouTube/Vimeo/etc). Esempio: https://www.youtube.com/watch?v=...',
      ),
      hidden: ({ document }) => (document?.type as MediaType) !== 'video',
      validation: (r) =>
        r.uri({ scheme: ['http', 'https'] }).custom((val, ctx) => {
          const docType = (ctx.document?.type as MediaType) ?? 'image';
          if (docType === 'video' && !val) return 'Video URL required';
          return true;
        }),
    }),

    // -----------------------------------------------------------------------
    // Tags (references)
    // NOTE: These require schemas: country, region, travelStyle
    // -----------------------------------------------------------------------

    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }], weak: true }],
      description: biDesc(
        'Tag the country/countries this media belongs to. Pick at least one if you want Regions to be selectable below.',
        'Seleziona il/i Paese/i a cui appartiene questo media. Scegline almeno uno per abilitare la selezione delle Regioni sotto.',
      ),
      validation: (r) => r.unique(),
    }),

    /**
     * Regions are “sub-areas” inside the selected countries.
     * Filter ensures you don’t accidentally tag “Tuscany” on a Thailand photo.
     */
    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],
          weak: true,
          options: {
            filter: ({ document }) => {
              const countryRefs = getRefIds(
                (document as UnknownRecord | null)?.countries,
              );

              // No countries selected → show nothing.
              if (!countryRefs.length) return { filter: 'false' };

              return {
                filter: 'country._ref in $countryRefs',
                params: { countryRefs },
              };
            },
            disableNew: false, // allow creating a missing region directly from here
          },
        },
      ],
      description: biDesc(
        'Select one or more sub-areas inside the selected countries (e.g. Northern Italy, Tuscany, Cyclades). If a region does not exist yet, you can create it directly from here.\nNaming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
        'Seleziona una o più sotto-aree dentro i Paesi selezionati (es. Nord Italia, Toscana, Cicladi). Se una regione non esiste, puoi crearla direttamente da qui.\nRegole nomi: Titolo con iniziali maiuscole, singolare, nomi geografici chiari (evita abbreviazioni o ripetere il nome del Paese).',
      ),
      hidden: ({ document }) =>
        getRefIds((document as UnknownRecord | null)?.countries).length === 0,
      validation: (r) => r.unique(),
    }),

    /**
     * Travel styles are editorial tags (not geography).
     * Editors can create new ones and reuse later.
     */
    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],
          weak: true,
          options: {
            disableNew: false, // allow creating from the picker
          },
        },
      ],
      description: biDesc(
        'Select travel styles that match this media (e.g. Slow Travel, Digital Nomad, Sailing). If a travel style does not exist yet, you can create it directly from the picker.\nNaming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
        'Seleziona gli stili di viaggio che descrivono questo media (es. Slow Travel, Digital Nomad, Vela). Se uno stile non esiste, puoi crearlo direttamente dal selettore.\nRegole nomi: Titolo con iniziali maiuscole, singolare, termini descrittivi (evita abbreviazioni o etichette troppo generiche).',
      ),
      validation: (r) => r.unique(),
    }),

    // -----------------------------------------------------------------------
    // Optional attribution
    // -----------------------------------------------------------------------
    defineField({
      name: 'credit',
      title: 'Credit / Photographer',
      type: 'string',
      description: biDesc(
        'Optional. Who shot this? (Name/brand). Leave empty for your own photos if not needed.',
        'Opzionale. Chi ha scattato? (Nome/brand). Lascia vuoto per foto vostre se non serve.',
      ),
    }),

    defineField({
      name: 'source',
      title: 'Source link',
      type: 'url',
      description: biDesc(
        'Optional. Original source URL (only if relevant). Must be http/https.',
        'Opzionale. URL della fonte originale (solo se rilevante). Deve essere http/https.',
      ),
      validation: (r) => r.uri({ scheme: ['http', 'https'] }),
    }),

  ],

  preview: {
    select: {
      title: 'title',
      type: 'type',
      media: 'image',
      alt: 'alt',
      altIt: 'altI18n.it',
      altEn: 'altI18n.en',
      capIt: 'captionI18n.it',
      capEn: 'captionI18n.en',
      // If heroEnabled or heroRank were present, update here:
      // heroEnabled: 'hero.enabled',
      // heroRank: 'hero.desktopRank',
    },
    prepare({ title, type, media, alt, altIt, altEn, capIt, capEn }) {
      const i18nCaption =
        (capIt as string | undefined) || (capEn as string | undefined);
      const i18nAlt =
        (altIt as string | undefined) || (altEn as string | undefined);
      const mainTitle =
        title || i18nCaption || alt || i18nAlt || 'Media Item';
      const subtitle = type ? `Type: ${type}` : undefined;

      return {
        title: mainTitle,
        subtitle,
        media,
      };
    },
  },
});
