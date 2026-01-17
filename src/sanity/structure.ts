import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // ---------------------------------------------------------------------
      // Media bucket
      // ---------------------------------------------------------------------
      S.listItem()
        .title('Media')
        .child(
          S.list()
            .title('Media')
            .items([S.documentTypeListItem('mediaItem').title('Media Items')]),
        ),

      S.divider(),

      // ---------------------------------------------------------------------
      // Content bucket
      // ---------------------------------------------------------------------
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.documentTypeListItem('post').title('Posts'),
              S.documentTypeListItem('page').title('Pages'),
              S.documentTypeListItem('author').title('Authors'),
              S.documentTypeListItem('siteSettings').title('Site Settings'),
            ]),
        ),

      S.divider(),

      // ---------------------------------------------------------------------
      // Travel Guide / Taxonomies
      // ---------------------------------------------------------------------
      S.listItem()
        .title('Travel Guide')
        .child(
          S.list()
            .title('Travel Guide')
            .items([
              S.documentTypeListItem('destination').title('Destinations'),
              S.documentTypeListItem('country').title('Countries'),
              S.documentTypeListItem('worldRegion').title('World Regions'),
              S.documentTypeListItem('region').title('Regions'),
              S.documentTypeListItem('travelStyle').title('Travel Styles'),
            ]),
        ),
    ]);
