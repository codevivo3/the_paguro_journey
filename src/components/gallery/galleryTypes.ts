import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export type GalleryImage = {
  src: string;
  /** Optional raw Sanity image source for focal-point aware URLs */
  sanityImage?: SanityImageSource;
  countrySlug: string;
  alt?: string;
  caption?:
    | string
    | null
    | {
        it?: string | null;
        en?: string | null;
      };

  /**
   * Original media orientation coming from Sanity.
   * Note: we may still "remix" the displayed aspect for a more dynamic masonry rhythm.
   */
  orientation?: 'portrait' | 'landscape' | 'square' | 'panorama';

  /**
   * Computed/original orientation derived from image asset dimensions.
   * Used for stricter rendering when lockOrientation is enabled.
   */
  assetOrientation?: 'landscape' | 'portrait' | 'square' | 'panorama';

  /**
   * If true, the gallery must keep this image in its original orientation.
   * This is for images that don't crop well when remixed.
   */
  lockOrientation?: boolean;

  /**
   * Optional Sanity image hotspot/crop helpers.
   * Used to keep the subject in-frame when we crop via object-fit: cover.
   */
  hotspot?: {
    x?: number;
    y?: number;
    height?: number;
    width?: number;
  } | null;
  crop?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  } | null;
};
