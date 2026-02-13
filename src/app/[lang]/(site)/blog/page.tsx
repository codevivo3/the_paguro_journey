// src/app/(site)/blog/page.tsx
import type { Metadata } from 'next';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import BlogCardClient from '@/components/features/blog/BlogCardClient';

import { getBlogPostsForIndex } from '@/sanity/queries/blog';
import { urlFor } from '@/sanity/lib/image';

import { formatDate } from '@/lib/date';
import { pickLang } from '@/lib/pickLang';
import { safeLang, withLangPrefix, type Lang } from '@/lib/route';

type PageProps = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang: rawLang } = await params;
  const lang: Lang = safeLang(rawLang);

  const meta = {
    it: {
      title: 'Blog | The Paguro Journey',
      description:
        'Racconti di viaggio, riflessioni e guide pratiche per un viaggio consapevole e lontano dai percorsi più battuti.',
    },
    en: {
      title: 'Blog | The Paguro Journey',
      description:
        'Travel stories, reflections, and practical guides for mindful journeys off the beaten path.',
    },
  } as const;

  const title = pickLang({ it: meta.it.title, en: meta.en.title }, lang) ?? meta.it.title;
  const description =
    pickLang({ it: meta.it.description, en: meta.en.description }, lang) ?? meta.it.description;

  return {
    title,
    description,
    alternates: { canonical: withLangPrefix(lang, '/blog') },
    openGraph: {
      title,
      description,
      url: withLangPrefix(lang, '/blog'),
      type: 'website',
      images: [
        {
          url: '/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'The Paguro Journey — Blog',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-default.jpg'],
    },
  };
}


// Fallback if post has no cover in Sanity
const BLOG_PLACEHOLDER_COVER = '/og-default.jpg';

function hasSanityAsset(
  image: unknown
): image is { asset: unknown } {
  return typeof image === 'object' && image !== null && 'asset' in image;
}

export default async function BlogPage({ params }: PageProps) {
  const { lang: rawLang } = await params;
  const lang: Lang = safeLang(rawLang);
  const posts = await getBlogPostsForIndex(lang);

  const t = {
    pageTitle: { it: 'Blog', en: 'Blog' },
    pageSubtitle: {
      it: 'Racconti, riflessioni e guide per un viaggio consapevole, lontano dai percorsi più battuti.',
      en: 'Travel stories, reflections, and guides for mindful journeys off the beaten path.',
    },
    sectionAria: { it: 'Articoli recenti', en: 'Latest articles' },
    sectionTitle: { it: 'Pubblicazioni recenti', en: 'Latest posts' },
    postSingular: { it: 'articolo', en: 'post' },
    postPlural: { it: 'articoli', en: 'posts' },
    openPostPrefix: { it: 'Apri articolo', en: 'Open post' },
  } as const;

  const pageTitle = pickLang(t.pageTitle, lang) ?? 'Blog';
  const pageSubtitle = pickLang(t.pageSubtitle, lang) ?? '';
  const sectionAria = pickLang(t.sectionAria, lang) ?? '';
  const sectionTitle = pickLang(t.sectionTitle, lang) ?? '';
  const openPostPrefix = pickLang(t.openPostPrefix, lang) ?? '';

  function getPostLabel(count: number, lang: Lang) {
    return count === 1
      ? pickLang(t.postSingular, lang) ?? ''
      : pickLang(t.postPlural, lang) ?? '';
  }

  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        <header className='space-y-3'>
          <h1 className='t-page-title'>{pageTitle}</h1>
          <p className='t-page-subtitle'>{pageSubtitle}</p>
        </header>

        <section aria-label={sectionAria} className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>{sectionTitle}</h2>
            <span className='t-meta'>
              {posts.length} {getPostLabel(posts.length, lang)}
            </span>
          </div>

          <Masonry>
            {posts.map((post, index) => {
              // Resolve Sanity image to URL (if present)
              const coverSrc = post.coverImage && hasSanityAsset(post.coverImage)
                ? urlFor(post.coverImage).width(1200).height(900).fit('crop').url()
                : BLOG_PLACEHOLDER_COVER;

              // We can’t know orientation from Sanity without storing it,
              // so keep your rhythm layout (same feel as before).
              const mediaAspect =
                index % 5 === 0
                  ? 'aspect-[4/5]'
                  : index % 3 === 0
                    ? 'aspect-[3/4]'
                    : 'aspect-video';

              const resolvedTitle =
                pickLang(lang, post.titleIt ?? undefined, post.titleEn ?? undefined) ??
                post.title;

              const resolvedExcerpt =
                pickLang(lang, post.excerptIt ?? undefined, post.excerptEn ?? undefined) ??
                (post.excerpt ?? '');

              const postDate = post.publishedAt ?? post.sortDate;
              const meta = postDate ? formatDate(postDate, lang) : undefined;

              return (
                <MasonryItem key={post._id}>
                  <BlogCardClient
                    href={withLangPrefix(lang, `/blog/${post.slug}`)}
                    title={resolvedTitle}
                    titleIt={post.titleIt}
                    titleEn={post.titleEn}
                    excerpt={resolvedExcerpt}
                    excerptIt={post.excerptIt}
                    excerptEn={post.excerptEn}
                    meta={meta}
                    coverSrc={coverSrc}
                    mediaAspect={mediaAspect}
                    ariaLabel={`${openPostPrefix}: ${resolvedTitle}`}
                    lang={lang}
                  />
                </MasonryItem>
              );
            })}
          </Masonry>
        </section>
      </div>
    </main>
  );
}
