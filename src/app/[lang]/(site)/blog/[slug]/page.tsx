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
import { getPostBySlug } from '@/sanity/queries/postBySlug';

import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

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
        ? 'Media reference (not expanded). Update the GROQ query to dereference content[] refs.'
        : 'Riferimento media (non espanso). Aggiorna la query GROQ per dereferenziare i riferimenti in content[].',
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

type SanityBlogPost = {
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt?: string;
  coverImage?: SanityImageSource | null;
  // `content` can include Portable Text blocks plus custom blocks.
  content?: Array<PortableTextBlock | MediaItem | CalloutBlock | MediaReference>;
};

type MediaItem = {
  _type: 'mediaItem';
  type?: 'image' | 'video';
  title?: string;
  alt?: string;
  caption?: string;
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
              {item.caption && (
                <p className='mt-2 text-sm opacity-80'>{item.caption}</p>
              )}
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
                alt={item.alt ?? item.title ?? ''}
                className='w-full rounded-sm'
                loading='lazy'
              />
              {(item.caption || item.credit) && (
                <p className='mt-2 text-xs opacity-50 italic'>
                  {item.caption}
                  {item.caption && item.credit ? ' · ' : ''}
                  {item.credit}
                </p>
              )}
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

function resolveSanityCover(post: SanityBlogPost) {
  // Prefer a dedicated cover field if you add it later.
  // For now, reuse coverImage as cover:
  return post.coverImage
    ? urlFor(post.coverImage).width(1600).height(900).fit('crop').url()
    : null;
}

function resolveSanityGallery(post: SanityBlogPost, limit = 6): string[] {
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

  const cover = resolveSanityCover(post);
  const gallery = resolveSanityGallery(post, 6);
  return (
    <PageShell className='pb-16 pt-24'>
      <article>
        <ArticleHeader title={post.title} date={post.publishedAt} />

        <CoverMedia src={cover ?? undefined} alt={post.title} priority />

        {/* keep your Prose blocks exactly as before for now */}
        <Prose className='mt-8'>
          {Array.isArray(post.content) ? (
            <PortableText
              value={
                post.content as Array<
                  PortableTextBlock | MediaItem | CalloutBlock | MediaReference
                >
              }
              components={portableTextComponents(effectiveLang)}
            />
          ) : null}
        </Prose>

        {gallery[0] && (
          <div className='mx-auto max-w-3xl'>
            <GalleryImage src={gallery[0]} alt={post.title} />
          </div>
        )}

        {/* rest unchanged */}
      </article>
    </PageShell>
  );
}
