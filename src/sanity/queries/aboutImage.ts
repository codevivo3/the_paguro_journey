import { client } from '@/sanity/lib/client';

export type SanityAboutImage = {
  _id: string;
  title?: string;
  alt?: string;
  caption?: string;
  image?: unknown; // Sanity image field
};

const ABOUT_IMAGE_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    aboutImage->{
      _id,
      title,
      alt,
      caption,
      image
    }
  }
`;

export async function getAboutImage() {
  const res = await client.fetch<{ aboutImage?: SanityAboutImage | null }>(
    ABOUT_IMAGE_QUERY,
    {},
    { next: { revalidate: 60 * 60 } },
  );

  return res?.aboutImage ?? null;
}
