// src/sanity/schemaTypes/objects/link.ts
import { defineType, defineField } from 'sanity';

export default defineType({
  name: 'link',
  title: 'Link',
  type: 'object',

  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'href',
      title: 'URL',
      type: 'url',
      validation: (r) => r.required(),
    }),

    defineField({
      name: 'external',
      title: 'Open in new tab',
      type: 'boolean',
      initialValue: false,
    }),
  ],
});
