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

  // Sanity Studio bundles env vars at build time for keys that start with SANITY_STUDIO_.
  // Depending on your bundler/runtime, these can be available via `process.env` and/or `import.meta.env`.
  // So we read both safely and fall back gracefully.
  const processEnv =
    typeof process !== 'undefined' && (process as unknown as { env?: Record<string, string | undefined> }).env
      ? (process as unknown as { env: Record<string, string | undefined> }).env
      : undefined;

  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;

  const readEnv = (key: string) => processEnv?.[key] ?? metaEnv?.[key];

  const baseUrl =
    readEnv('SANITY_STUDIO_SITE_URL') ??
    readEnv('VITE_SANITY_STUDIO_SITE_URL') ??
    'http://localhost:3000';

  const secret =
    readEnv('SANITY_STUDIO_PREVIEW_SECRET') ??
    readEnv('VITE_SANITY_STUDIO_PREVIEW_SECRET');

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
