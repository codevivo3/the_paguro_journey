// src/sanity/schemaTypes/index.ts
import type { SchemaTypeDefinition } from 'sanity';

/* -------------------------------------------------------------------------- */
/* Documents                                                                  */
/* -------------------------------------------------------------------------- */

// Media
import mediaItem from './documents/mediaItem';

// Global / Settings
import siteSettings from './documents/siteSettings';

// Content
import post from './documents/post';
import author from './documents/author';
import page from './documents/page';

// Travel Guide
import destination from './documents/destination';

/* -------------------------------------------------------------------------- */
/* Taxonomy                                                                   */
/* -------------------------------------------------------------------------- */

import country from './taxonomy/country';
import region from './taxonomy/region';
import travelStyle from './taxonomy/travelStyle';

/* -------------------------------------------------------------------------- */
/* Objects                                                                    */
/* -------------------------------------------------------------------------- */

import portableText from './objects/portableText';
import link from './objects/link';
import seo from './objects/seo';

/* -------------------------------------------------------------------------- */
/* Schema export                                                              */
/* -------------------------------------------------------------------------- */

export const schemaTypes: SchemaTypeDefinition[] = [
  /* Media */
  mediaItem,

  /* Global */
  siteSettings,

  /* Content */
  page,
  post,
  author,

  /* Travel Guide */
  destination,

  /* Taxonomy */
  country,
  region,
  travelStyle,

  /* Objects */
  portableText,
  link,
  seo,
];
