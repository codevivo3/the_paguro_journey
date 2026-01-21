// src/sanity/schemaTypes/documents/siteSettings.ts
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',

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

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Global                                                                 */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'siteTitle',
      title: 'Site Title (internal)',
      type: 'string',
      description:
        'Internal label for the project. Not necessarily the SEO title. ' +
        'Example: “The Paguro Journey”.',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Home — Hero                                                            */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'homeHeroHeadline',
      title: 'Home Hero Headline',
      type: 'string',
      readOnly: true,
      description: 'Owner-managed. Request changes to the developer.',
    }),
    defineField({
      name: 'homeHeroSubheadline',
      title: 'Home Hero Subheadline',
      type: 'text',
      rows: 2,
      readOnly: true,
      description: 'Owner-managed. Request changes to the developer.',
    }),

    defineField({
      name: 'homeHeroSlides',
      title: 'Home Hero Slideshow',
      type: 'array',
      description:
        'Curated slideshow for the homepage hero. Drag to reorder. ' +
        'Uses Media Items (images only). Recommended: 3–7 slides.',
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
              'type == "image" && orientation in ["landscape", "panorama"]',
          },
        },
      ],
      validation: (r) =>
        r.min(1).warning('At least one hero slide is recommended.'),
    }),

    /* ---------------------------------------------------------------------- */
    /* About                                                                  */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'aboutImage',
      title: 'About page image',
      type: 'reference',
      to: [{ type: 'mediaItem' }],
      description: 'Single curated image for the About page (Chi siamo).',
      options: {
        filter: 'type == "image"',
      },
    }),

    /* ---------------------------------------------------------------------- */
    /* Blog                                                                   */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'blogPageTitle',
      title: 'Blog Page Title',
      type: 'string',
      description:
        'Headline shown at the top of the blog index page (optional). ' +
        'If empty, the page can fall back to a default in the UI.',
    }),

    defineField({
      name: 'blogPageIntro',
      title: 'Blog Page Intro',
      type: 'text',
      rows: 4,
      description:
        'Optional intro paragraph shown on the blog index page. Keep it scannable.',
    }),

    /* ---------------------------------------------------------------------- */
    /* Footer / Misc                                                          */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'footerNote',
      title: 'Footer Note',
      type: 'string',
      description:
        'Optional short footer text. Example: © The Paguro Journey — All rights reserved.',
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
