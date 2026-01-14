// src/sanity/schemaTypes/documents/siteSettings.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

  // Guardrail: only one settings document
  __experimental_formPreviewTitle: false,

  fields: [
    // ---------------------------------------------------------------------
    // Global
    // ---------------------------------------------------------------------
    defineField({
      name: 'siteTitle',
      title: 'Site Title',
      type: 'string',
      description: 'Internal reference only (not necessarily SEO title).',
    }),

    // ---------------------------------------------------------------------
    // Home — Hero
    // ---------------------------------------------------------------------
    defineField({
      name: 'homeHeroHeadline',
      title: 'Home Hero Headline',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'homeHeroSubheadline',
      title: 'Home Hero Subheadline',
      type: 'text',
      rows: 2,
    }),

    defineField({
      name: 'homeHeroSlides',
      title: 'Home Hero Slideshow',
      description:
        'Curated list. Drag to reorder. References Media Items (images only).',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'mediaItem' }],
          options: {
            // Strong editorial guardrail
            filter:
              'type == "image" && orientation in ["landscape", "panorama"]',
          },
        },
      ],
      validation: (r) => r.min(1).warning('At least one slide is recommended'),
    }),

    // ---------------------------------------------------------------------
    // Blog
    // ---------------------------------------------------------------------
    defineField({
      name: 'blogPageTitle',
      title: 'Blog Page Title',
      type: 'string',
      description: 'Displayed at the top of the blog index page.',
    }),

    defineField({
      name: 'blogPageIntro',
      title: 'Blog Page Intro',
      type: 'text',
      rows: 4,
    }),

    // ---------------------------------------------------------------------
    // Footer / Misc (future-proof, optional)
    // ---------------------------------------------------------------------
    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'string',
      description: 'Small text shown in the footer (optional).',
    }),
  ],

  preview: {
    prepare() {
      return {
        title: 'Site Settings',
        subtitle: 'Global configuration',
      };
    },
  },
});
