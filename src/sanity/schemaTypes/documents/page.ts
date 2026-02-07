// src/sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity';
import { BookIcon } from '@sanity/icons';
import React, { type ReactElement } from 'react';

type UnknownRecord = Record<string, unknown>;

/** Safely read `slug.current` from an unknown Sanity document. */
function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = (doc?.['slug'] as UnknownRecord | undefined) ?? undefined;
  return slug?.['current'] as string | undefined;
}

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
  name: 'page',
  title: 'Page',
  description: biDesc(
    'Use Pages for static site sections such as, Collabs, Press, FAQ, Privacy and other evergreen content. Pages can be published or hidden using Status.',
    'Usa le Pagine per sezioni statiche del sito come Collaborazioni, Stampa, FAQ, Privacy e altri contenuti evergreen. Le pagine possono essere pubblicate o nascoste tramite lo Status.'
  ),
  type: 'document',

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: biDesc(
        'Internal and public title for this page (e.g. “About”, “Contact”, “Privacy Policy”).',
        'Titolo interno e pubblico della pagina (es. “Chi siamo”, “Contatti”, “Privacy Policy”).'
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: biDesc(
        'URL path for this page (auto-generated from title). Avoid changing it after publishing to prevent broken links.',
        'Percorso URL della pagina (generato automaticamente dal titolo). Evita di modificarlo dopo la pubblicazione per non rompere i link.'
      ),
      options: {
        source: 'title',
        maxLength: 96,
      },
      /**
       * Lock slug once created to keep URLs stable.
       */
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* SEO                                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description: biDesc(
        'Optional but recommended. Overrides default site metadata for this page.',
        'Opzionale ma consigliato. Sovrascrive i metadati di default del sito per questa pagina.'
      ),
    }),

    /* ---------------------------------------------------------------------- */
    /* Hero / Cover image                                                     */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'coverImage',
      title: 'Cover image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      options: {
        filter: 'type == "image"',
      },
      description: biDesc(
        'Optional header image for this page. Used for hero sections or page headers. Choose a strong, representative image.',
        'Immagine di copertina opzionale per la pagina. Usata come hero o intestazione. Scegli un’immagine rappresentativa.'
      ),
      // Hide for the internal editor guide to keep it text-only and stable
      hidden: false,
    }),

    /* ---------------------------------------------------------------------- */
    /* Content                                                                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'content',
      title: 'Page content',
      type: 'array',
      description: biDesc(
        'Main page body. Use headings and short paragraphs. Keep it scannable.',
        'Contenuto principale della pagina. Usa titoli e paragrafi brevi. Mantieni il testo leggibile e scansionabile.'
      ),
      of: [
        { type: 'block' },

        // NOTE:
        // This uses the basic Sanity image block.
        // If you want full reuse from your Media Library,
        // switch this to a reference to `mediaItem`.
        { type: 'image', options: { hotspot: true } },
      ],
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Publishing                                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: biDesc(
        'Draft pages are hidden on the website until published.',
        'Le pagine in bozza non sono visibili sul sito finché non vengono pubblicate.'
      ),
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: biDesc(
        'Optional. Useful if you want to display a publish or last-updated date.',
        'Opzionale. Utile se vuoi mostrare la data di pubblicazione o ultimo aggiornamento.'
      ),
    }),
  ],

  preview: {
    select: {
      title: 'title',
      status: 'status',
      slug: 'slug.current',
      cover: 'coverImage.image',
    },
    prepare({ title, status, slug, cover }) {
      const parts = [
        status ? status.toUpperCase() : 'DRAFT',
        slug ? `/${slug}` : null,
      ].filter(Boolean);

      const media = cover || BookIcon;

      return {
        title: title || 'Untitled page',
        subtitle: parts.join(' • '),
        media,
      };
    },
  },
});
