// src/sanity/schemaTypes/documents/author.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'author',
  title: 'Author',
  type: 'document',

  /**
   * Author profiles used across the site.
   *
   * Notes:
   * - Typically one author per post, but supports multiple if needed.
   * - Keep bios short and timeless.
   * - This is editorial content, not user accounts.
   */

  fields: [
    /* ---------------------------------------------------------------------- */
    /* Identity                                                               */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Author’s display name as shown on posts and author pages.',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      description:
        'URL identifier derived from the name. Avoid changing this once published.',
      validation: (r) => r.required(),
    }),

    /* ---------------------------------------------------------------------- */
    /* Profile                                                                */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'image',
      title: 'Profile Image',
      type: 'image',
      options: { hotspot: true },
      description:
        'Author portrait or representative image. Square images work best.',
    }),

    defineField({
      name: 'bio',
      title: 'Bio',
      type: 'text',
      rows: 4,
      description:
        'Short author bio shown on posts or author pages. ' +
        'Keep it concise (2–4 sentences) and evergreen.',
      validation: (r) => r.max(300),
    }),

    /* ---------------------------------------------------------------------- */
    /* Links (optional)                                                       */
    /* ---------------------------------------------------------------------- */

    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
      description: 'Personal or professional website (optional).',
    }),

    defineField({
      name: 'social',
      title: 'Social Links',
      type: 'object',
      description:
        'Optional social profiles. Add only platforms you actively use.',
      fields: [
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          description: 'Full URL to Instagram profile.',
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
          description: 'Channel or profile URL.',
        }),
        defineField({
          name: 'x',
          title: 'X / Twitter',
          type: 'url',
          description: 'Profile URL on X (Twitter).',
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'name',
      media: 'image',
    },
    prepare({ title, media }) {
      return {
        title,
        media,
      };
    },
  },
});
