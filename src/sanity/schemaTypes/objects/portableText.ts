// src/sanity/schemaTypes/objects/portableText.ts
import { defineType } from 'sanity';

/**
 * Portable Text (rich content block).
 *
 * Used for:
 * - Long-form editorial content (posts, pages, destinations)
 * - Structured text with headings, quotes, links, and images
 *
 * Philosophy:
 * - Keep formatting intentionally limited to preserve visual consistency
 * - Avoid “design by editor” — layout decisions belong to the frontend
 */

export default defineType({
  name: 'portableText',
  title: 'Content',
  type: 'array',

  of: [
    {
      type: 'block',

      // -------------------------------------------------------------------
      // Text styles (semantic, not visual)
      // -------------------------------------------------------------------
      styles: [
        {
          title: 'Normal',
          value: 'normal',
        },
        {
          title: 'Heading',
          value: 'h2',
        },
        {
          title: 'Subheading',
          value: 'h3',
        },
        {
          title: 'Quote',
          value: 'blockquote',
        },
      ],

      // -------------------------------------------------------------------
      // Lists
      // -------------------------------------------------------------------
      lists: [
        {
          title: 'Bullet list',
          value: 'bullet',
        },
      ],

      // -------------------------------------------------------------------
      // Inline formatting
      // -------------------------------------------------------------------
      marks: {
        decorators: [
          {
            title: 'Bold',
            value: 'strong',
          },
          {
            title: 'Italic',
            value: 'em',
          },
        ],

        // Inline objects (annotations)
        annotations: [
          {
            name: 'link',
            type: 'link',
            title: 'Link',
          },
        ],
      },
    },

    // -------------------------------------------------------------------
    // Inline images
    // -------------------------------------------------------------------
    {
      type: 'image',
      options: { hotspot: true },
    },
  ],
});
