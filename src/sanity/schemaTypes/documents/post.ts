// src/sanity/schemaTypes/documents/post.ts
import { defineType, defineField, useFormValue } from 'sanity';
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

// -----------------------------------------------------------------------------
// Studio-only Preview button (schema-level field UI)
// -----------------------------------------------------------------------------

function getSiteBaseUrl(): string | null {
  // Sanity Studio runs on Vite. Env vars should be available on import.meta.env.
  const viteEnv =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env) ||
    undefined;

  const fromVite =
    viteEnv?.SANITY_STUDIO_SITE_URL ?? viteEnv?.NEXT_PUBLIC_SANITY_STUDIO_SITE_URL;

  // Node-style env (rare in Studio browser runtime, but useful in tests/scripts)
  const fromNode =
    (typeof process !== 'undefined'
      ? ((process.env.NEXT_PUBLIC_SANITY_STUDIO_SITE_URL as string | undefined) ??
          (process.env.SANITY_STUDIO_SITE_URL as string | undefined))
      : undefined) ??
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      ?.process?.env?.NEXT_PUBLIC_SANITY_STUDIO_SITE_URL ??
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      ?.process?.env?.SANITY_STUDIO_SITE_URL;

  // Local dev fallback: if Studio is hosted inside the same Next app, this is correct.
  const fromWindow = typeof window !== 'undefined' ? window.location.origin : undefined;

  const url = (fromVite ?? fromNode ?? fromWindow ?? '').trim();
  return url ? url.replace(/\/$/, '') : null;
}

function getPreviewSecret(): string | null {
  const viteEnv =
    (typeof import.meta !== 'undefined' &&
      (import.meta as unknown as { env?: Record<string, string | undefined> }).env) ||
    undefined;

  const fromVite =
    viteEnv?.SANITY_STUDIO_PREVIEW_SECRET ??
    viteEnv?.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_SECRET;

  const fromNode =
    (typeof process !== 'undefined'
      ? ((process.env.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_SECRET as string | undefined) ??
          (process.env.SANITY_STUDIO_PREVIEW_SECRET as string | undefined))
      : undefined) ??
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      ?.process?.env?.NEXT_PUBLIC_SANITY_STUDIO_PREVIEW_SECRET ??
    (globalThis as unknown as { process?: { env?: Record<string, string | undefined> } })
      ?.process?.env?.SANITY_STUDIO_PREVIEW_SECRET;

  const secret = (fromVite ?? fromNode ?? '').trim();
  return secret || null;
}

function getStudioLang(): string {
  // Studio path is usually `/` or `/structure/...` so auto-detect is unreliable.
  // Default to Italian unless you later add a lang field.
  if (typeof window === 'undefined') return 'it';
  const [, maybeLang] = window.location.pathname.split('/');
  return maybeLang === 'en' || maybeLang === 'it' ? maybeLang : 'it';
}

function buildPreviewUrl(slugCurrent?: string): string | null {
  const siteUrl = getSiteBaseUrl();
  const secret = getPreviewSecret();
  if (!siteUrl || !secret) return null;

  const slugValue = (slugCurrent ?? '').trim();
  if (!slugValue) return null;

  const cleanSlug = slugValue.startsWith('/') ? slugValue.slice(1) : slugValue;
  const lang = getStudioLang();

  // We pass a *path* the Next route will redirect to.
  const previewSlug = `/${lang}/blog/${cleanSlug}`;
  const previewApi = `/${lang}/api/studio/preview`;

  const url = new URL(previewApi, siteUrl);
  url.searchParams.set('secret', secret);
  url.searchParams.set('slug', previewSlug);
  return url.toString();
}

function PreviewLinkInput() {
  const [isHover, setIsHover] = React.useState(false);
  const slug = useFormValue(['slug', 'current']) as string | undefined;
  const previewUrl = buildPreviewUrl(slug);

  const siteUrl = getSiteBaseUrl();
  const secret = getPreviewSecret();

  const disabledReason = !slug
    ? 'Add a Slug first to enable Preview.'
    : !siteUrl
      ? 'Missing SANITY_STUDIO_SITE_URL in Studio env.'
      : !secret
        ? 'Missing SANITY_STUDIO_PREVIEW_SECRET in Studio env.'
        : !previewUrl
          ? 'Preview URL could not be built.'
          : null;

  const helpText = previewUrl
    ? `Open the live preview for this post (draft mode enabled).`
    : `${disabledReason} (Detected siteUrl: ${siteUrl ?? 'null'}, secret: ${secret ? 'set' : 'null'})`;

  return React.createElement(
    'div',
    {
      style: {
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      },
    },
    previewUrl
      ? React.createElement(
          'a',
          {
            href: previewUrl,
            target: '_blank',
            rel: 'noopener noreferrer',
            onMouseEnter: () => setIsHover(true),
            onMouseLeave: () => setIsHover(false),
            style: {
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              background: isHover ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
              border: isHover
                ? '1px solid rgba(255,255,255,0.22)'
                : '1px solid rgba(255,255,255,0.14)',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 650,
              transition: 'background 120ms ease, border-color 120ms ease, transform 120ms ease',
              transform: isHover ? 'translateY(-1px)' : 'translateY(0px)',
            },
            title: 'Open preview in a new tab',
          },
          'Open Preview ↗',
        )
      : React.createElement(
          'span',
          {
            style: {
              fontSize: '0.95rem',
              opacity: 0.8,
            },
          },
          helpText,
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

    defineField({
      name: 'previewLink',
      title: 'Preview',
      type: 'string',
      readOnly: true,
      description: biDesc(
        'Studio-only helper. Opens a server-protected preview URL for this post (draft mode enabled).',
        'Helper solo Studio. Apre una preview protetta lato server per questo post (draft mode attivo).',
      ),
      components: {
        input: PreviewLinkInput,
      },
    }),
  ],

  preview: {
    select: {
      title: 'titleIt',
      seoTitle: 'seo.title',
      publishedAt: 'publishedAt',
      // For Studio list thumbnail: follow the coverImage reference and grab its image
      coverImage: 'coverImage.image',
    },
    prepare({ title, seoTitle, publishedAt, coverImage }) {
      const date = publishedAt ? new Date(publishedAt).toLocaleDateString() : '';
      const baseSubtitle = date ? `Published · ${date}` : 'Published';

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
