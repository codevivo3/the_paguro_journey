// src/sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity';
import { BookIcon } from '@sanity/icons';

type UnknownRecord = Record<string, unknown>;

/**
 * Safely extract the current slug value from a Sanity document.
 *
 * Why this exists:
 * - In schema callbacks (`readOnly`, `hidden`, etc.) `document` is typed as `unknown`
 * - Direct access like `document.slug.current` causes TypeScript errors
 * - This helper keeps access safe, explicit, and future-proof
 */
function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = doc?.['slug'] as UnknownRecord | undefined;
  return slug?.['current'] as string | undefined;
}

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',

  /**
   * 🔒 Editorial guardrail (field-level)
   *
   * We want the internal “Guida Editor” page to be mostly immutable,
   * BUT still allow setting a cover image so it shows a nice thumbnail in the list.
   *
   * Therefore we do NOT lock the whole document; we lock specific fields below.
   */
  // readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',

  /**
   * 🧨 Prevent deletion of important pages
   * (runtime-supported by Sanity, not typed yet)
   */
  // @ts-expect-error Sanity supports this at runtime
  __experimental_actions: ['create', 'update', 'publish'],

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Core                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description:
        'Internal + public title for this page (e.g. “About”, “Contact”, “Privacy Policy”).',
      readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL path for this page (auto-generated from title). ' +
        'Avoid changing it after publishing to prevent broken links.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      /**
       * Lock slug once created to keep URLs stable.
       */
      readOnly: ({ document }) => Boolean(getSlugCurrent(document)) || getSlugCurrent(document) === 'guida-editor',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* SEO                                                                    */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'seo',
      description:
        'Optional but recommended. Overrides default site metadata for this page.',
      readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',
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
      description:
        'Optional header image for this page. Used for hero sections or page headers. ' +
        'Choose a strong, representative image.',
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
      description:
        'Main page body. Use headings and short paragraphs. Keep it scannable.',
      of: [
        { type: 'block' },

        // NOTE:
        // This uses the basic Sanity image block.
        // If you want full reuse from your Media Library,
        // switch this to a reference to `mediaItem`.
        { type: 'image', options: { hotspot: true } },
      ],
      readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Publishing                                                             */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Draft pages are hidden on the website until published.',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Published', value: 'published' },
        ],
        layout: 'radio',
      },
      readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      description:
        'Optional. Useful if you want to display a publish or last-updated date.',
      readOnly: ({ document }) => getSlugCurrent(document) === 'guida-editor',
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

      const isEditorGuide = slug === 'guida-editor';
      const media = cover || (isEditorGuide ? BookIcon : undefined);

      return {
        title: title || 'Untitled page',
        subtitle: parts.join(' • '),
        media,
      };
    },
  },
});
