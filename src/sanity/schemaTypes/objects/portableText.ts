// src/sanity/schemaTypes/objects/portableText.ts
import { defineType } from 'sanity';

export default defineType({
  name: 'portableText',
  title: 'Portable Text',
  type: 'array',

  of: [
    {
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'link',
          },
        ],
      },
    },
    {
      type: 'image',
      options: { hotspot: true },
    },
  ],
});
