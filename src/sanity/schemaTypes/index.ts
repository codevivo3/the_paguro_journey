// src/sanity/schemaTypes/index.ts
import { type SchemaTypeDefinition } from 'sanity';

import mediaItem from './documents/mediaItem';
import siteSettings from './documents/siteSettings';
import post from './documents/post';
import page from './documents/page';
import author from './documents/author';
import destination from './documents/destination';
import country from './taxonomy/country';
import region from './taxonomy/region';
import travelStyle from './taxonomy/travelStyle';

import link from './objects/link';
import portableText from './objects/portableText';
import seo from './objects/seo';

export const schema = {
  types: [
    // Documents
    mediaItem,
    siteSettings,
    post,
    page,
    author,
    destination,
    country,
    region,
    travelStyle,

    // Objects
    link,
    portableText,
    seo,
  ] as SchemaTypeDefinition[],
};