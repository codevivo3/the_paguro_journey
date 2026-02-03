// src/sanity/schemaTypes/documents/post.ts
import { defineType, defineField } from 'sanity';
import React from 'react';
import type { ReactElement } from 'react';

/**
 * We keep helper typing extremely lightweight because Sanity `document`
 * is typed as `unknown` inside callbacks (filter/hidden/readOnly).
 */
type UnknownRecord = Record<string, unknown>;

/** Extracts `_ref` from a Sanity reference-like value. */
function getRefId(value: unknown): string | undefined {
  const v = value as UnknownRecord | null;
  return (v?._ref as string | undefined) ?? undefined;
}

/** Extracts a list of `_ref` from an array of reference-like values. */
function getRefIds(value: unknown): string[] {
  const arr = value as unknown[] | null;
  if (!Array.isArray(arr)) return [];

  return arr
    .map((item) => getRefId(item))
    .filter((id): id is string => Boolean(id));
}

// -----------------------------------------------------------------------------
// Studio description helper (EN + IT, visually separated)
// -----------------------------------------------------------------------------

function biDesc(en: string, it: string): ReactElement {
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(
      'div',
      { style: { marginBottom: '0.35rem' } },
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
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  description: biDesc(
    'A blog article. Write Italian + optional English so the site can be bilingual-ready. Slug uses the Italian title.',
    'Un articolo del blog. Scrivi Italiano + Inglese opzionale per avere il sito pronto al bilingue. Lo slug usa il titolo italiano.',
  ),

  fieldsets: [
    { name: 'langIt', title: 'Italiano (obbligatorio)' },
    { name: 'langEn', title: 'English (optional)' },
    { name: 'seo', title: 'SEO (English)' },
  ],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'titleIt',
      title: 'Titolo (Italiano)',
      type: 'string',
      fieldset: 'langIt',
      description: biDesc(
        'Main title (Italian). Used to generate the slug/URL. Keep it clear and human.',
        'Titolo principale (Italiano). Usato per generare lo slug/URL. Chiaro e umano.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'titleEn',
      title: 'Title (English)',
      type: 'string',
      fieldset: 'langEn',
      description: biDesc(
        'English title for the EN site (optional). If empty, the EN site can fall back to Italian.',
        'Titolo in inglese per il sito EN (opzionale). Se vuoto, il sito EN può usare l’italiano.',
      ),
    }),

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      description: biDesc(
        'Card cover image shown on Blog listings and previews. The referenced Media Item should already include bilingual accessibility alt text and bilingual captions (IT/EN).',
        'Immagine di copertina mostrata nelle card del Blog e nelle anteprime. Il Media Item collegato dovrebbe già includere alt text per accessibilità e didascalie bilingue (IT/EN).',
      ),
      options: {
        filter: 'type == "image"',
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {
        source: 'titleIt',
        maxLength: 96,
      },
      description: biDesc(
        'Auto-generated from the Italian title. Keep it short and readable (used in the page URL).',
        'Generato automaticamente dal titolo italiano. Mantienilo breve e leggibile (usato nell’URL).',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'excerptIt',
      title: 'Excerpt (Italiano)',
      type: 'text',
      rows: 3,
      fieldset: 'langIt',
      description: biDesc(
        '1–2 sentences in Italian. Used in cards/previews and social sharing.',
        '1–2 frasi in italiano. Usato in card/anteprime e condivisione social.',
      ),
      validation: (r) => r.max(200),
    }),

    defineField({
      name: 'excerptEn',
      title: 'Excerpt (English)',
      type: 'text',
      rows: 3,
      fieldset: 'langEn',
      description: biDesc(
        'Optional English excerpt for the EN site. If empty, fallback can use Italian.',
        'Estratto in inglese opzionale per il sito EN. Se vuoto, si può usare l’italiano.',
      ),
      validation: (r) => r.max(200),
    }),

    defineField({
      name: 'contentIt',
      title: 'Content (Italiano)',
      type: 'array',
      fieldset: 'langIt',
      of: [
        {
          type: 'block',
          // Keep Callout as a "style" in the same dropdown where H2/H3/Quote live
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },
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

        // Media blocks (reuse Media bucket)
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
        },

        // Callout blocks (styled boxes in the article)
        {
          name: 'callout',
          title: 'Callout',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Optional heading shown at the top of the callout box.',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: 'title', body: 'body' },
            prepare({ title }) {
              return {
                title: title || 'Callout',
                subtitle: 'Callout box',
              };
            },
          },
        },
      ],
      description: biDesc(
        'Main article body (Italian). Add text blocks and reusable media items.',
        'Corpo principale dell’articolo (Italiano). Aggiungi testo e media riutilizzabili.',
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'contentEn',
      title: 'Content (English)',
      type: 'array',
      fieldset: 'langEn',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H1', value: 'h1' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'H4', value: 'h4' },
            { title: 'H5', value: 'h5' },
            { title: 'H6', value: 'h6' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },
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
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
        },
        {
          name: 'callout',
          title: 'Callout',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              description: 'Optional heading shown at the top of the callout box.',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: 'title', body: 'body' },
            prepare({ title }) {
              return {
                title: title || 'Callout',
                subtitle: 'Callout box',
              };
            },
          },
        },
      ],
      description: biDesc(
        'Optional English version for the EN site. If empty, the EN site can fall back to Italian.',
        'Versione inglese opzionale per il sito EN. Se vuota, il sito EN può usare l’italiano.',
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* SEO (English)                                                           */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'seo',
      title: 'SEO (English)',
      type: 'object',
      fieldset: 'seo',
      description: biDesc(
        'Optional English-only SEO fields used for metadata (title/description). If empty, the site can fall back to the English title/excerpt (or Italian fallback).',
        'Campi SEO opzionali SOLO in inglese usati per i metadati (titolo/descrizione). Se vuoti, il sito può usare titolo/estratto (inglese o fallback italiano).',
      ),
      fields: [
        defineField({
          name: 'title',
          title: 'Meta title (EN)',
          type: 'string',
          description: biDesc(
            'Optional. Overrides the <title> tag for this post on the EN site. Keep ~50–60 characters.',
            'Opzionale. Sovrascrive il tag <title> per questo post sul sito EN. Tieni ~50–60 caratteri.',
          ),
          validation: (r) => r.max(70),
        }),
        defineField({
          name: 'description',
          title: 'Meta description (EN)',
          type: 'text',
          rows: 3,
          description: biDesc(
            'Optional. Used for the meta description on the EN site. Aim for ~140–160 characters.',
            'Opzionale. Usata come meta description sul sito EN. Punta a ~140–160 caratteri.',
          ),
          validation: (r) => r.max(180),
        }),
      ],
      options: { collapsed: true, collapsible: true },
    }),

    /* ---------------------------------------------------------------------- */
    /* Meta                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description:
        'Optional. If empty, the website can fall back to “last updated”.',
    }),

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      description:
        'Draft = not live. Published = visible on the website (depending on your frontend logic).',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Relations (used for filtering, discovery, and grouping)                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'countries',
      title: 'Countries',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'country' }] }],
      description:
        'Select one or more countries this post relates to. (Choose first — it unlocks Regions.)',
      validation: (r) => r.unique(),
    }),

    defineField({
      name: 'regions',
      title: 'Regions (sub-areas)',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'region' }],

          /**
           * `weak: true` allows publishing the Post even if a referenced Region
           * is still a draft/unpublished doc. Useful for “create now, refine later”.
           */
          weak: true,

          options: {
            /**
             * Filter regions to only those that belong to the selected countries.
             * Prevents messy cross-country regions appearing in the picker.
             */
            filter: ({ document }) => {
              const countryRefs = getRefIds(
                (document as UnknownRecord | null)?.countries,
              );

              // When no countries are selected, show nothing (avoids confusion).
              if (!countryRefs.length) return { filter: 'false' };

              return {
                filter: 'country._ref in $countryRefs',
                params: { countryRefs },
              };
            },

            /**
             * Keep this false so editors can create regions on the fly
             * (e.g. "Northern Italy") and reuse them later.
             */
            disableNew: false,
          },
        },
      ],
      description:
        'Select one or more regions inside the chosen countries (e.g. Northern Italy, Tuscany, Cyclades). ' +
        'If a region does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, clear geographic names (avoid abbreviations or repeating the country name).',
      hidden: ({ document }) =>
        getRefIds((document as UnknownRecord | null)?.countries).length === 0,
      validation: (r) => r.unique(),
    }),

    defineField({
      name: 'travelStyles',
      title: 'Travel Styles',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'travelStyle' }],

          /**
           * Same logic as Regions:
           * allow draft/unpublished styles while still publishing the post.
           */
          weak: true,

          options: {
            // Let editors create styles from inside the Post editor
            disableNew: false,
          },
        },
      ],
      description:
        'Select one or more travel styles that describe this post (e.g. Slow Travel, Digital Nomad, Sailing). ' +
        'If a travel style does not exist yet, you can create it directly from here.\n' +
        'Naming convention: Title Case, singular, descriptive terms (avoid abbreviations or overly generic labels).',
      validation: (r) => r.unique(),
    }),
  ],

  preview: {
    select: {
      title: 'titleIt',
      seoTitle: 'seo.title',
      status: 'status',
      publishedAt: 'publishedAt',
      // For Studio list thumbnail: follow the coverImage reference and grab its image
      coverImage: 'coverImage.image',
    },
    prepare({ title, seoTitle, status, publishedAt, coverImage }) {
      const baseSubtitle =
        status === 'published'
          ? `Published · ${publishedAt ? new Date(publishedAt).toLocaleDateString() : ''}`
          : 'Draft';

      // Show SEO title only as an internal hint (do NOT use it as the main title)
      const seoHint = seoTitle ? ` · SEO: ${seoTitle}` : '';

      return {
        title: title || 'Untitled',
        subtitle: `${baseSubtitle}${seoHint}`,
        media: coverImage,
      };
    },
  },
});
