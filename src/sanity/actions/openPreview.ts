import type { DocumentActionComponent } from 'sanity';
import { LaunchIcon } from '@sanity/icons';

type PostWithSlug = {
  _type: 'post';
  slug?: { current?: string };
};

export const openPreviewAction: DocumentActionComponent = (props) => {
  const doc = (props.draft ?? props.published) as unknown;

  // only for posts
  if (!doc || (doc as { _type?: string })._type !== 'post') return null;

  const slug = (doc as PostWithSlug)?.slug?.current;

  // Studio runs in the browser -> only NEXT_PUBLIC_* reliably exists
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const secret = process.env.NEXT_PUBLIC_PREVIEW_SECRET;

  const canOpen = Boolean(slug && secret);
  const url = canOpen
    ? `${baseUrl}/api/draft?secret=${encodeURIComponent(secret!)}&slug=${encodeURIComponent(slug!)}`
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
          'Missing NEXT_PUBLIC_PREVIEW_SECRET in .env.local. Add it and restart dev server.',
        );

      window.open(url, '_blank', 'noopener,noreferrer');
    },
  };
};
