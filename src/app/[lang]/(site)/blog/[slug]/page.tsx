import { notFound } from 'next/navigation';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import { PortableText } from '@portabletext/react';
import type {
  PortableTextComponents,
  PortableTextBlock,
} from '@portabletext/react';
import Image from 'next/image';

import { urlFor } from '@/sanity/lib/image';
import { getPostBySlug, type BlogPostBySlug } from '@/sanity/queries/postBySlug';

import { safeLang, withLangPrefix, type Lang } from '@/lib/route';
import { pickLang } from '@/lib/pickLang';

import {
  ArticleHeader,
  CalloutBox,
  CoverMedia,
  GalleryImage,
  PageShell,
  Prose,
} from '@/components/blog/BlogReusable';

import type { SanityImageSource } from '@sanity/image-url/lib/types/types';


type PageParams = { slug: string; lang: Lang };

function ptLabels(lang: Lang) {
  return {
    videoTitleFallback: lang === 'en' ? 'Video' : 'Video',
    mediaBlockTitle: lang === 'en' ? 'Media block' : 'Blocco media',
    mediaRefHint:
      lang === 'en'
        ? 'Media reference (not expanded). Update the GROQ query to dereference refs inside contentIt[] / contentEn[] (or the resolved content[]).'
        : 'Riferimento media (non espanso). Aggiorna la query GROQ per dereferenziare i riferimenti dentro contentIt[] / contentEn[] (o nel content[] risolto).',
  } as const;
}

type MediaReference = {
  _type: 'reference';
  _ref: string;
};

type CalloutBlock = {
  _type: 'callout';
  title?: string;
  // Portable Text blocks for the callout body
  body?: PortableTextBlock[];
};

type MediaItem = {
  _type: 'mediaItem';
  type?: 'image' | 'video';
  title?: string;

  // Single-string fallbacks
  alt?: string;

  // Bilingual fields
  altI18n?: { it?: string; en?: string };
  captionI18n?: { it?: string; en?: string };

  // Resolved by GROQ (preferred when present)
  altA11yResolved?: string;
  captionResolved?: string;

  credit?: string;
  image?: SanityImageSource | null;
  videoUrl?: string;
};

const portableTextComponents = (lang: Lang): PortableTextComponents => {
  const t = ptLabels(lang);

  return {
    types: {
      // When you dereference `content[]` refs in GROQ, media blocks will arrive as full `mediaItem` objects.
      mediaItem: ({ value }) => {
        const item = value as MediaItem;

        if (item?.type === 'video' && item.videoUrl) {
          return (
            <div className='my-8'>
              <div className='aspect-video w-full overflow-hidden rounded-md'>
                <iframe
                  src={item.videoUrl}
                  title={item.title ?? t.videoTitleFallback}
                  className='h-full w-full'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              </div>
              {(() => {
                const cap =
                  item.captionResolved ??
                  pickLang(lang, item.captionI18n?.it, item.captionI18n?.en);
                return cap ? (
                  <p className='mt-2 text-sm opacity-80'>{cap}</p>
                ) : null;
              })()}
            </div>
          );
        }

        if (item?.type === 'image' && item.image) {
          const src = urlFor(item.image).width(1600).height(900).fit('crop').url();
          return (
            <div className='my-8'>
              <Image
                src={src}
                width={1600}
                height={900}
                alt={item.altA11yResolved ?? item.alt ?? item.title ?? ''}
                className='w-full rounded-sm'
                loading='lazy'
              />
              {(() => {
                const cap =
                  item.captionResolved ??
                  pickLang(lang, item.captionI18n?.it, item.captionI18n?.en);
                return cap || item.credit ? (
                  <p className='mt-2 text-xs opacity-50 italic'>
                    {cap}
                    {cap && item.credit ? ' · ' : ''}
                    {item.credit}
                  </p>
                ) : null;
              })()}
            </div>
          );
        }

        // Fallback: if a mediaItem is incomplete
        return null;
      },

      // If your `content` array still contains raw references (no GROQ deref yet), this prevents a blank render.
      reference: () => (
        <CalloutBox title={t.mediaBlockTitle}>
          {t.mediaRefHint}{' '}
          <code>content[]</code>
        </CalloutBox>
      ),

      callout: ({ value }) => {
        const v = value as CalloutBlock;

        return (
          <div className="t-body text-sm italic leading-relaxed text-[color:var(--paguro-text-muted)]">
            <CalloutBox title={v.title}>{
              Array.isArray(v.body) ? (
                <PortableText value={v.body as PortableTextBlock[]} />
              ) : null
            }</CalloutBox>
          </div>
        );
      },
    },

    block: {
      h2: ({ children }) => (
        <h2 className='mt-10 text-3xl font-bold'>{children}</h2>
      ),
      h3: ({ children }) => (
        <h3 className='mt-8 text-2xl font-bold'>{children}</h3>
      ),
      h4: ({ children }) => (
        <h4 className='mt-6 text-xl font-bold'>{children}</h4>
      ),
      normal: ({ children }) => <p className='my-5 leading-7'>{children}</p>,

      blockquote: ({ children }) => (
        <blockquote className='my-8 border-l-4 border-white/20 pl-4 italic opacity-90'>
          {children}
        </blockquote>
      ),
    },

    marks: {
      link: ({ children, value }) => {
        const href = (value as { href?: string })?.href;
        if (!href) return <>{children}</>;
        const isExternal = href.startsWith('http');
        return (
          <a
            href={href}
            className='underline underline-offset-4'
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
          >
            {children}
          </a>
        );
      },
    },

    list: {
      bullet: ({ children }) => (
        <ul className='my-6 list-disc pl-6'>{children}</ul>
      ),
      number: ({ children }) => (
        <ol className='my-6 list-decimal pl-6'>{children}</ol>
      ),
    },

    listItem: {
      bullet: ({ children }) => <li className='my-2'>{children}</li>,
      number: ({ children }) => <li className='my-2'>{children}</li>,
    },
  };
};

function resolveSanityCover(post: BlogPostBySlug) {
  const m = post.coverImage;
  if (m?.type === 'image' && m.image) {
    return urlFor(m.image).width(1600).height(900).fit('crop').url();
  }
  return null;
}

function resolveSanityGallery(post: BlogPostBySlug, limit = 6): string[] {
  // If later you add a `gallery` field, use it here.
  // For now, just return an empty array (your UI can handle it)
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, lang } = await params;
  const effectiveLang: Lang = safeLang(lang);
  const { isEnabled } = await draftMode();
  const post = await getPostBySlug(slug, { preview: isEnabled });
  if (!post)
    return {
      title:
        effectiveLang === 'en'
          ? 'Post not found | The Paguro Journey'
          : 'Articolo non trovato | The Paguro Journey',
    };

  const cover = resolveSanityCover(post);
  return {
    title: `${post.title} | The Paguro Journey`,
    description: post.excerpt,
    alternates: { canonical: withLangPrefix(effectiveLang, `/blog/${post.slug}`) },
    openGraph: cover
      ? {
          title: post.title,
          description: post.excerpt,
          type: 'article',
          url: withLangPrefix(effectiveLang, `/blog/${post.slug}`),
          images: [{ url: cover, width: 1200, height: 630, alt: post.title }],
        }
      : {
          title: post.title,
          description: post.excerpt,
          type: 'article',
          url: withLangPrefix(effectiveLang, `/blog/${post.slug}`),
        },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, lang } = await params;
  const effectiveLang: Lang = safeLang(lang);
  const { isEnabled } = await draftMode();
  const post = await getPostBySlug(slug, { preview: isEnabled });
  if (!post) notFound();

  const title = pickLang(effectiveLang, post.titleIt, post.titleEn) ?? post.titleIt;
  const excerpt = pickLang(effectiveLang, post.excerptIt, post.excerptEn);
  const content = pickLang(effectiveLang, post.contentIt, post.contentEn);

  const cover = resolveSanityCover(post);
  const gallery = resolveSanityGallery(post, 6);
  return (
    <PageShell className='pb-16 pt-24'>
      <article>
        <ArticleHeader title={title} date={post.publishedAt} />

        <CoverMedia src={cover ?? undefined} alt={title} priority />

        {/* keep your Prose blocks exactly as before for now */}
        <Prose className='mt-8'>
          {Array.isArray(content) ? (
            <PortableText
              value={
                content as Array<
                  PortableTextBlock | MediaItem | CalloutBlock | MediaReference
                >
              }
              components={portableTextComponents(effectiveLang)}
            />
          ) : null}
        </Prose>

        {gallery[0] && (
          <div className='mx-auto max-w-3xl'>
            <GalleryImage src={gallery[0]} alt={title} />
          </div>
        )}

        {/* rest unchanged */}
      </article>
    </PageShell>
  );
}
