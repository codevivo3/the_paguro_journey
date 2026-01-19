// src/sanity/schemaTypes/objects/link.ts
import { defineType, defineField } from 'sanity';

/**
 * Reusable Link object.
 *
 * Used for:
 * - Inline links inside rich content
 * - Buttons / CTAs
 * - Navigation or editorial references
 *
 * This is intentionally lightweight and editor-friendly.
 * Behavior (e.g. target="_blank") is handled at render time.
 */

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',

  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description:
        'Visible text for the link (e.g. “Read more”, “Visit website”). ' +
        'Keep it short, clear, and action-oriented.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      description:
        'Full destination URL. ' +
        'Use absolute URLs for external sites (https://…), ' +
        'or relative paths for internal pages (e.g. /destinations/thailand).',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
      description:
        'Enable for external websites. ' +
        'Leave off for internal links to preserve navigation and accessibility.',
    }),
  ],
});
