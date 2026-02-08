import type { DocumentActionComponent } from 'sanity';
import { LaunchIcon } from '@sanity/icons';

type PostWithSlug = {
  _type: 'post';
  slug?: { current?: string };
};

export const openPreviewAction: DocumentActionComponent = (props) => {
  const doc = (props.draft ?? props.published) as unknown;

  // Only for posts
  if (!doc || (doc as { _type?: string })._type !== 'post') return null;

  const slug = (doc as PostWithSlug)?.slug?.current;

  // Sanity Studio runs in the browser -> only SANITY_STUDIO_* and import.meta.env are reliable.
  // Set these in Sanity Studio env (or Vercel env for the Studio deployment):
  // - SANITY_STUDIO_SITE_URL (e.g. https://the-paguro-journey.vercel.app)
  // - SANITY_STUDIO_PREVIEW_SECRET (must match Next.js PREVIEW_SECRET)
  type ImportMetaWithEnv = ImportMeta & {
    env: Record<string, string | undefined>;
  };

  const env = (import.meta as ImportMetaWithEnv).env;

  const baseUrl =
    env.SANITY_STUDIO_SITE_URL ??
    env.VITE_SANITY_STUDIO_SITE_URL ??
    'http://localhost:3000';

  const secret =
    env.SANITY_STUDIO_PREVIEW_SECRET ??
    env.VITE_SANITY_STUDIO_PREVIEW_SECRET;

  // Next.js expects a PATH for `slug` (e.g. /blog/my-post)
  // Your post slug is usually "my-post" so we convert it.
  const previewPath = slug ? `/blog/${slug}` : '';

  const canOpen = Boolean(previewPath && secret);

  const url = canOpen
    ? `${baseUrl}/api/preview?secret=${encodeURIComponent(
        secret!,
      )}&slug=${encodeURIComponent(previewPath)}`
    : '';

  return {
    label: canOpen ? 'Open Preview' : 'Open Preview (missing env)',
    icon: LaunchIcon,
    tone: canOpen ? 'primary' : 'caution',
    disabled: !canOpen,
    onHandle: () => {
      if (!slug) return alert('No slug yet — generate the slug first.');
      if (!secret)
        return alert(
          'Missing SANITY_STUDIO_PREVIEW_SECRET. Add it to Studio env vars and reload the Studio.',
        );

      window.open(url, '_blank', 'noopener,noreferrer');
    },
  };
};
