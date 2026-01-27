// src/sanity/queries/homeDivider.ts
import { client } from '@/sanity/lib/client';

export type HomeDividerData = {
  media?: {
    _id: string;
    title?: string;
    alt?: string;
    credit?: string;
    imageUrl?: string;
  } | null;
  altOverride?: string | null;
  caption?: string | null;
  link?: string | null;
} | null;

const HOME_DIVIDER_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "media": homeDivider.media->{
      _id,
      title,
      alt,
      credit,
      "imageUrl": image.asset->url
    },
    "altOverride": homeDivider.altOverride,
    "caption": homeDivider.caption,
    "link": homeDivider.link
  }
`;

export async function getHomeDivider(): Promise<HomeDividerData> {
  const isDev = process.env.NODE_ENV === 'development';

  return client.fetch(
    HOME_DIVIDER_QUERY,
    {},
    isDev ? { cache: 'no-store' } : { next: { revalidate: 60 * 60 } },
  );
}
