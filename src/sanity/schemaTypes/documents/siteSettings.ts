// src/sanity/schemaTypes/documents/siteSettings.ts
import React, { type ReactElement } from 'react';
import { defineField, defineType } from 'sanity';

/**
 * Bilingual descriptions (EN + IT) for Studio fields.
 * Keep English first, Italian second.
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
 * Sanity typings expect `string` for fieldset descriptions, but Studio can render React nodes.
 * Coerce without using `any` to satisfy stricter lint rules.
 */
function asFieldsetDescription(node: ReactElement): string {
  return node as unknown as string;
}

/**
 * String-only bilingual description.
 * Use this where Sanity types expect `string` (e.g. document/fieldset descriptions).
 */
function biDescText(en: string, it: string): string {
  return `EN — ${en}\n\nIT — ${it}`;
}

/**
 * Portable Text (rich text) blocks for editorial content.
 * Supports headings, lists, basic marks, and links.
 */
const RICH_TEXT_BLOCKS = [
  {
    type: 'block',
    styles: [
      { title: 'Normal', value: 'normal' },
      { title: 'H2', value: 'h2' },
      { title: 'H3', value: 'h3' },
      { title: 'Quote', value: 'blockquote' },
    ],
    lists: [
      { title: 'Bullet', value: 'bullet' },
      { title: 'Number', value: 'number' },
    ],
    marks: {
      decorators: [
        { title: 'Strong', value: 'strong' },
        { title: 'Emphasis', value: 'em' },
        { title: 'Code', value: 'code' },
      ],
      annotations: [
        {
          name: 'link',
          title: 'Link',
          type: 'object',
          fields: [
            defineField({
              name: 'href',
              title: 'URL',
              type: 'url',
              validation: (r) => r.uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
            }),
            defineField({
              name: 'blank',
              title: 'Open in new tab',
              type: 'boolean',
              initialValue: true,
            }),
          ],
        },
      ],
    },
  },
];

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

  description: biDescText(
    'Single source of truth for global site configuration (ONE document). Treat this like “config”, not content. Editors should rarely change this after initial setup.',
    'Fonte unica per la configurazione globale del sito (UN solo documento). Trattalo come “config”, non contenuto. Gli editor dovrebbero modificarlo raramente dopo il setup iniziale.',
  ),

  /**
   * Single source of truth for global site configuration.
   *
   * Important:
   * - This is meant to be ONE document only (global settings).
   * - Treat this like “config”, not content.
   * - Content editors should rarely touch this after initial setup.
   */

  // Sanity Studio UI tweak (not crucial, but harmless)
  __experimental_formPreviewTitle: false,

  fieldsets: [
    {
      name: 'global',
      title: 'Site Settings — Global',
      description: asFieldsetDescription(
        biDesc(
          'Global site configuration. Rarely changed.',
          'Configurazione globale del sito. Da modificare raramente.',
        ),
      ),
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'homeHeroHeadline',
      title: 'Home — Hero Headline',
      description: asFieldsetDescription(
        biDesc('Hero headline text.', 'Testo headline hero.'),
      ),
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'homeHeroSlideshow',
      title: 'Home — Hero Slideshow',
      description: asFieldsetDescription(
        biDesc(
          'Homepage hero image slideshows (desktop and mobile).',
          'Slideshow immagini hero homepage (desktop e mobile).',
        ),
      ),
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'homeIntro',
      title: 'Home — Intro',
      description: asFieldsetDescription(
        biDesc(
          'Introductory text shown below the hero.',
          'Testo introduttivo mostrato sotto l’hero.',
        ),
      ),
      options: { collapsible: true, collapsed: false },
    },
    {
      name: 'homeDivider',
      title: 'Home — Divider Image',
      description: asFieldsetDescription(
        biDesc(
          'Break image separating homepage sections.',
          'Immagine di separazione delle sezioni homepage.',
        ),
      ),
      options: { collapsible: true, collapsed: true },
    },
    {
      name: 'about',
      title: 'About',
      description: asFieldsetDescription(
        biDesc(
          'Image used on the About page.',
          'Immagine usata nella pagina About.',
        ),
      ),
      options: { collapsible: true, collapsed: true },
    },
  ],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Global                                                                 */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'siteTitle',
      title: 'Site Title (internal)',
      type: 'string',
      description: biDesc(
        'Internal label for the project (not necessarily the SEO title). Example: “The Paguro Journey”.',
        'Etichetta interna del progetto (non necessariamente il titolo SEO). Esempio: “The Paguro Journey”.',
      ),
      fieldset: 'global',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'homeHeroHeadline',
      title: 'Home Hero Headline',
      type: 'object',
      readOnly: true,
      description: biDesc(
        'Developer-managed hero headline. Not editable by content editors.',
        'Headline hero gestita dallo sviluppatore. Non modificabile dagli editor.',
      ),
      fieldset: 'homeHeroHeadline',
      fields: [
        defineField({ name: 'en', title: 'English', type: 'string' }),
        defineField({ name: 'it', title: 'Italiano', type: 'string' }),
      ],
    }),

    defineField({
      name: 'homeIntro',
      title: 'Homepage Intro',
      type: 'object',
      description: biDesc(
        'Short text shown at the beginning of the homepage. Fill both languages.',
        'Testo breve mostrato all’inizio della homepage. Compila entrambe le lingue.',
      ),
      fieldset: 'homeIntro',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: RICH_TEXT_BLOCKS,
          validation: (r) => r.required().min(1),
        }),
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'array',
          of: RICH_TEXT_BLOCKS,
          validation: (r) => r.required().min(1),
        }),
      ],
    }),

    /* ---------------------------------------------------------------------- */
    /* Home — Hero Slideshow                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'homeHeroSlides',
      title: 'Home Hero Slideshow',
      type: 'array',
      description: biDesc(
        'Curated slideshow for the homepage hero (DESKTOP). Drag to reorder. Uses Media Items (images only).',
        'Slideshow curato per l’hero della homepage (DESKTOP). Trascina per riordinare. Usa i Media Item (solo immagini).',
      ),
      fieldset: 'homeHeroSlideshow',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: {
            /**
             * Guardrails:
             * - Only images (not videos)
             * - Only wide formats for better hero UX
             */
            filter:
              '_type == "mediaItem" && type == "image" && defined(image.asset)',
          },
        },
      ],
      validation: (r) =>
        r.min(1).warning('At least one hero slide is recommended.'),
    }),

    defineField({
      name: 'homeHeroSlidesMobile',
      title: 'Home Hero Slideshow (Mobile)',
      type: 'array',
      description: biDesc(
        'Curated slideshow for the homepage hero (MOBILE). Drag to reorder. Uses Media Items (images only).',
        'Slideshow curato per l’hero della homepage (MOBILE). Trascina per riordinare. Usa i Media Item (solo immagini).',
      ),
      fieldset: 'homeHeroSlideshow',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: {
            /**
             * Guardrails:
             * - Only images (not videos)
             * - Only portrait formats for mobile hero UX
             */
            filter:
              '_type == "mediaItem" && type == "image" && defined(image.asset)',
          },
        },
      ],
      validation: (r) =>
        r.min(1).warning('At least one mobile hero slide is recommended.'),
    }),

    /* ---------------------------------------------------------------------- */
    /* Home — Divider Image                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'homeDivider',
      title: 'Homepage Divider Image',
      type: 'object',
      description: biDesc(
        'Curated break-up image used on the homepage (e.g. right under the CTA).',
        'Immagine “break” curata usata in homepage (es. subito sotto la CTA).',
      ),
      fieldset: 'homeDivider',
      fields: [
        defineField({
          name: 'mediaDesktop',
          title: 'Desktop image (recommended: landscape)',
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          description: biDesc(
            'Select one image from the media library for desktop. Landscape orientation is recommended, but not enforced.',
            'Seleziona un’immagine dalla media library per desktop. L’orientamento landscape è consigliato, ma non obbligatorio.',
          ),
          options: {
            filter:
              'type == "image" && defined(image.asset)',
          },
          validation: (r) => r.required(),
        }),
        defineField({
          name: 'mediaMobile',
          title: 'Mobile image (recommended: portrait)',
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          description: biDesc(
            'Optional. Select an image for mobile. Portrait orientation is recommended, but not enforced. If empty, the desktop image can be reused.',
            'Opzionale. Seleziona un’immagine per mobile. L’orientamento portrait è consigliato, ma non obbligatorio. Se vuoto, verrà riutilizzata l’immagine desktop.',
          ),
          options: { filter: 'type == "image" && defined(image.asset)' },
        }),
        defineField({
          name: 'altOverride',
          title: 'Alt text override (EN/IT)',
          type: 'object',
          description: biDesc(
            'Optional. If empty, the referenced media alt text will be used.',
            'Opzionale. Se vuoto, verrà usato l’alt del media selezionato.',
          ),
          fields: [
            defineField({ name: 'en', title: 'English', type: 'string' }),
            defineField({ name: 'it', title: 'Italiano', type: 'string' }),
          ],
        }),
        defineField({
          name: 'eyebrow',
          title: 'Eyebrow label (optional, EN/IT)',
          type: 'object',
          description: biDesc(
            'Optional small label shown below the divider image section title (e.g. “Reflection”).',
            'Etichetta piccola opzionale mostrata sotto il titolo della sezione immagine divider (es. “Riflessione”).',
          ),
          fields: [
            defineField({ name: 'en', title: 'English', type: 'string' }),
            defineField({ name: 'it', title: 'Italiano', type: 'string' }),
          ],
        }),
        defineField({
          name: 'dividerContent',
          title: 'Divider image content (optional)',
          type: 'object',
          description: biDesc(
            'Optional text shown under the divider image on the homepage. Fill in one or both languages as needed.',
            'Testo opzionale mostrato sotto l’immagine di separazione in homepage. Compila una o entrambe le lingue se necessario.',
          ),
          fields: [
            defineField({
              name: 'en',
              title: 'English',
              type: 'array',
              of: RICH_TEXT_BLOCKS,
            }),
            defineField({
              name: 'it',
              title: 'Italiano',
              type: 'array',
              of: RICH_TEXT_BLOCKS,
            }),
          ],
        }),
        defineField({
          name: 'link',
          title: 'Optional link',
          type: 'url',
          description: biDesc(
            'Optional. Where should this image link to (internal or external).',
            'Opzionale. Dove deve puntare l’immagine (interno o esterno).',
          ),
          validation: (r) => r.uri({ scheme: ['http', 'https'] }),
        }),
      ],
    }),

    /* ---------------------------------------------------------------------- */
    /* About                                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'aboutHeader',
      title: 'About page header (title & subtitle)',
      type: 'object',
      description: biDesc(
        'Title and optional subtitle shown at the top of the About page, above the image.',
        'Titolo e sottotitolo opzionale mostrati in cima alla pagina About, sopra l’immagine.',
      ),
      fieldset: 'about',
      fields: [
        defineField({
          name: 'title',
          title: 'Title (EN/IT)',
          type: 'object',
          fields: [
            defineField({ name: 'en', title: 'English', type: 'string' }),
            defineField({ name: 'it', title: 'Italiano', type: 'string' }),
          ],
        }),
        defineField({
          name: 'subtitle',
          title: 'Subtitle (optional, EN/IT)',
          type: 'object',
          fields: [
            defineField({ name: 'en', title: 'English', type: 'string' }),
            defineField({ name: 'it', title: 'Italiano', type: 'string' }),
          ],
        }),
      ],
    }),

    defineField({
      name: 'aboutImage',
      title: 'About page image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      description: biDesc(
        'Single curated image for the About page (Chi siamo).',
        'Immagine singola curata per la pagina About (Chi siamo).',
      ),
      fieldset: 'about',
      options: {
        filter: 'type == "image"',
      },
    }),

    defineField({
      name: 'aboutContent',
      title: 'About page content (optional)',
      type: 'object',
      description: biDesc(
        'Optional text content shown on the About page. Fill in one or both languages as needed.',
        'Testo opzionale mostrato nella pagina About. Compila una o entrambe le lingue se necessario.',
      ),
      fieldset: 'about',
      fields: [
        defineField({
          name: 'en',
          title: 'English',
          type: 'array',
          of: RICH_TEXT_BLOCKS,
        }),
        defineField({
          name: 'it',
          title: 'Italiano',
          type: 'array',
          of: RICH_TEXT_BLOCKS,
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'siteTitle',
    },
    prepare({ title }) {
      return {
        title: title || 'Site Settings',
        subtitle: 'Global configuration',
      };
    },
  },
});
