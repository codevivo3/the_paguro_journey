// src/sanity/schemaTypes/documents/page.ts
import { defineType, defineField } from 'sanity';

type UnknownRecord = Record<string, unknown>;

function getSlugCurrent(document: unknown): string | undefined {
  const doc = document as UnknownRecord | null;
  const slug = (doc?.['slug'] as UnknownRecord | undefined) ?? undefined;
  return slug?.['current'] as string | undefined;
}

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',

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
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description:
        'URL path for this page (auto-generated from title). ' +
        'Try not to change it after publishing to avoid broken links.',
      options: {
        source: 'title',
        maxLength: 96,
      },
      // Lock once it exists (prevents URL churn)
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
      description:
        'Optional but recommended. Overrides default site metadata for this page.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Content                                                                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'content',
      title: 'Page content',
      type: 'array',
      description:
        'Main page body. Use headings + short paragraphs. Keep it scannable.',
      of: [
        { type: 'block' },

        // NOTE: Basic Sanity image block.
        // If you want to reuse your media library instead, switch this to:
        // { type: 'reference', to: [{ type: 'mediaItem' }] }
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
      description:
        'Draft pages are hidden on the website until you publish them.',
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
      description:
        'Optional. Leave empty unless you want to display a “last updated”/publish date.',
    }),
  ],

  preview: {
    select: {
      title: 'title',
      status: 'status',
      slug: 'slug.current',
    },
    prepare({ title, status, slug }) {
      const parts = [
        status ? status.toUpperCase() : 'DRAFT',
        slug ? `/${slug}` : null,
      ].filter(Boolean);

      return {
        title: title || 'Untitled page',
        subtitle: parts.join(' • '),
      };
    },
  },
});
