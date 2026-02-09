// src/sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity';
import { BookIcon } from '@sanity/icons';
import React, { type ReactElement } from 'react';
import { useFormValue } from 'sanity';

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

/** Resolve the site base URL from env vars or fallback to window.location.origin */
function getSiteUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return (
    import.meta.env.SANITY_STUDIO_SITE_URL ??
    import.meta.env.NEXT_PUBLIC_SANITY_STUDIO_SITE_URL ??
    window.location.origin
  );
}

/** Resolve the preview secret from env vars */
function getPreviewSecret(): string | undefined {
  return (
    import.meta.env.SANITY_STUDIO_PREVIEW_SECRET ??
    import.meta.env.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_SECRET
  );
}

/** Build preview URL for given slug and language */
function buildPreviewUrl(slug: string, lang = 'it'): string | undefined {
  const siteUrl = getSiteUrl();
  const secret = getPreviewSecret();
  if (!siteUrl || !secret || !slug) return undefined;
  const encodedSlug = encodeURIComponent(`/${lang}/${slug}`);
  return `${siteUrl}/${lang}/api/studio/preview?secret=${encodeURIComponent(secret)}&slug=${encodedSlug}`;
}

/** Studio-only React component rendering a preview link button */
function PreviewLinkInput(): ReactElement {
  const slug = useFormValue(['slug', 'current']) as string | undefined;
  const previewUrl = slug ? buildPreviewUrl(slug) : undefined;

  const isDisabled = !slug || !previewUrl;

  const handleClick = (): void => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        fontSize: '0.875rem',
      },
    },
    React.createElement(
      'button',
      {
        type: 'button',
        disabled: isDisabled,
        onClick: handleClick,
        style: {
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          color: isDisabled ? '#999' : '#1e40af',
          background: 'none',
          border: 'none',
          padding: 0,
          textDecoration: isDisabled ? 'none' : 'underline',
          fontWeight: '600',
        },
        title: isDisabled
          ? 'Slug or environment variables missing'
          : 'Open Preview in new tab',
      },
      'Open Preview ↗',
    ),
    isDisabled &&
      React.createElement(
        'span',
        { style: { color: '#999', fontStyle: 'italic' } },
        !slug ? 'Slug is required' : 'Missing preview secret or site URL',
      ),
  );
}

export default defineType({
  name: 'page',
  title: 'Page',
  description: biDesc(
    'Use Pages for static site sections such as Collabs, Press, FAQ, Privacy and other evergreen content.',
    'Usa le Pagine per sezioni statiche del sito come Collaborazioni, Stampa, FAQ, Privacy e altri contenuti evergreen.'
  ),
  type: 'document',
  fieldsets: [
    { name: 'langIt', title: 'Italiano (obbligatorio)' },
    { name: 'langEn', title: 'English (optional)' },
  ],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'titleIt',
      title: 'Page title (Italiano)',
      type: 'string',
      fieldset: 'langIt',
      description: biDesc(
        'Italian title for this page (required). Used to generate the slug.',
        'Titolo italiano della pagina (obbligatorio). Usato per generare lo slug.'
      ),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'titleEn',
      title: 'Page title (English)',
      type: 'string',
      fieldset: 'langEn',
      description: biDesc(
        'Optional English title. If empty, the EN site can fall back to Italian.',
        'Titolo inglese opzionale. Se vuoto, il sito EN può usare l’italiano.'
      ),
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
        source: 'titleIt',
        maxLength: 96,
      },
      /**
       * Lock slug once created to keep URLs stable.
       */
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)),
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'subtitleIt',
      title: 'Page subtitle (Italiano)',
      type: 'string',
      fieldset: 'langIt',
      description: biDesc(
        'Optional Italian subtitle / short intro line shown under the title.',
        'Sottotitolo / riga introduttiva opzionale in italiano mostrata sotto il titolo.'
      ),
    }),

    defineField({
      name: 'subtitleEn',
      title: 'Page subtitle (English)',
      type: 'string',
      fieldset: 'langEn',
      description: biDesc(
        'Optional English subtitle for the EN site. If empty, fallback can use Italian.',
        'Sottotitolo inglese opzionale per il sito EN. Se vuoto, si può usare l’italiano.'
      ),
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
      name: 'contentIt',
      title: 'Page content (Italiano)',
      type: 'array',
      fieldset: 'langIt',
      description: biDesc(
        'Main page body in Italian (required). Use headings and short paragraphs. Keep it scannable.',
        'Contenuto principale in italiano (obbligatorio). Usa titoli e paragrafi brevi. Mantieni il testo leggibile e scansionabile.'
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

    defineField({
      name: 'contentEn',
      title: 'Page content (English)',
      type: 'array',
      fieldset: 'langEn',
      description: biDesc(
        'Optional English version for the EN site. If empty, the EN site can fall back to Italian.',
        'Versione inglese opzionale per il sito EN. Se vuota, il sito EN può usare l’italiano.'
      ),
      of: [
        { type: 'block' },
        { type: 'image', options: { hotspot: true } },
      ],
    }),

    /* ---------------------------------------------------------------------- */
    /* Publishing                                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description: biDesc(
        'Optional. Useful if you want to display a publish or last-updated date.',
        'Opzionale. Utile se vuoi mostrare la data di pubblicazione o ultimo aggiornamento.'
      ),
    }),

    defineField({
      name: 'previewLink',
      title: 'Preview',
      type: 'string',
      readOnly: true,
      description: biDesc(
        'Studio-only helper. Opens a server-protected preview URL for this page (draft mode enabled).',
        'Helper solo Studio. Apre una preview protetta lato server per questa pagina (draft mode attivo).'
      ),
      components: { input: PreviewLinkInput },
    }),
  ],

  preview: {
    select: {
      title: 'titleIt',
      slug: 'slug.current',
      cover: 'coverImage.image',
    },
    prepare({ title, slug, cover }) {
      const parts = [slug ? `/${slug}` : null].filter(Boolean);

      const media = cover || BookIcon;

      return {
        title: title || 'Untitled page',
        subtitle: parts.join(' • '),
        media,
      };
    },
  },
});
