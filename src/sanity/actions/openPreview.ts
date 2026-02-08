import type { DocumentActionComponent } from 'sanity';
import { LaunchIcon } from '@sanity/icons';

type PostWithSlug = {
  _type: 'post';
  slug?: { current?: string };
};

function getStudioOrigin(): string | null {
  if (typeof window === 'undefined') return null;
  return window.location.origin;
}

function getStudioLang(): string | null {
  if (typeof window === 'undefined') return null;
  const [, lang] = window.location.pathname.split('/');
  return lang || null;
}

function buildPreviewUrlTemplate(slugCurrent?: string): string | null {
  const origin = getStudioOrigin();
  if (!origin) return null;

  const slug = slugCurrent?.startsWith('/') ? slugCurrent : `/${slugCurrent ?? ''}`;
  const lang = getStudioLang();
  const blogPath = `/blog${slug}`;
  const previewSlug = lang ? `/${lang}${blogPath}` : blogPath;
  const previewPath = lang ? `/${lang}/api/studio/preview` : '/api/studio/preview';

  const url = new URL(previewPath, origin);
  url.searchParams.set('secret', 'YOUR_SECRET');
  url.searchParams.set('slug', previewSlug);
  return url.toString();
}

export const openPreviewAction: DocumentActionComponent = (props) => {
  const doc = (props.draft ?? props.published) as unknown;

  // Only for posts
  if (!doc || (doc as { _type?: string })._type !== 'post') return null;

  const slug = (doc as PostWithSlug)?.slug?.current;

  const urlTemplate = buildPreviewUrlTemplate(slug);
  const canOpen = Boolean(slug && urlTemplate);

  return {
    label: canOpen ? 'Open Preview (requires secret)' : 'Open Preview (add slug)',
    icon: LaunchIcon,
    tone: canOpen ? 'primary' : 'caution',
    disabled: true,
    onHandle: () => {
      if (!slug) return alert('No slug yet — generate the slug first.');
      if (!urlTemplate) return alert('Preview URL is not available in this context.');
      return alert(
        `Preview is server-protected. Use this URL template and replace YOUR_SECRET:\n\n${urlTemplate}`,
      );
    },
  };
};
