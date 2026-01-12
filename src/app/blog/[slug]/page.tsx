import { notFound } from 'next/navigation';

import { posts } from '@/lib/posts';
import { resolvePostCover, resolvePostGallery } from '@/lib/posts-media';

import type { Metadata } from 'next';

import {
  ArticleHeader,
  CalloutBox,
  CoverMedia,
  GalleryImage,
  PageShell,
  Prose,
} from '@/components/blog/BlogReusable';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: 'Articolo non trovato | The Paguro Journey',
    };
  }

  const description =
    post.excerpt ??
    'Racconti di viaggio, riflessioni lente e guide consapevoli firmate The Paguro Journey.';

  const cover = resolvePostCover(post);

  return {
    title: `${post.title} | The Paguro Journey`,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      url: `/blog/${post.slug}`,
      images: cover
        ? [
            {
              url: cover,
              width: 1200,
              height: 630,
              alt: post.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title: post.title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  // Resolve media from a single source of truth (gallery + covers).
  // Fallback logic:
  // 1) Explicit post.gallery
  // 2) Destination-based gallery
  // This guarantees visual consistency across blog, destinations and gallery pages.
  const gallery = resolvePostGallery(post, 6);

  return (
    <PageShell className='pb-16 pt-24'>
      <article className='space-y-10'>
        <ArticleHeader title={post.title} date={post.date} />

        <CoverMedia src={resolvePostCover(post)} alt={post.title} priority />

        <Prose className='mt-8'>
          <p className='lead'>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer non
            feugiat arcu. Suspendisse potenti.
          </p>

          <p>
            Praesent euismod, nibh at porta egestas, sem est lacinia nulla, in
            ullamcorper lorem tellus a justo.
          </p>

          <h2>Lorem ipsum heading</h2>

          <p>
            Donec posuere, metus sit amet pulvinar blandit, arcu libero
            ullamcorper risus, a elementum elit lorem at metus.
          </p>

          <ul>
            <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
            <li>
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </li>
            <li>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco
              laboris.
            </li>
          </ul>

          <blockquote>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </blockquote>
        </Prose>

        <div className='mx-auto max-w-3xl'>
          <GalleryImage src={gallery[0]} alt={post.title} />
        </div>

        <Prose className='mt-8'>
          <h2>Lorem ipsum: section two</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>

          <h3>A smaller subheading</h3>
          <p>
            Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
            posuere cubilia curae.
          </p>
        </Prose>

        <div className='mx-auto max-w-3xl'>
          <GalleryImage src={gallery[1]} alt={post.title} />
        </div>

        <Prose className='mt-8'>
          <h2>Lorem ipsum: section three</h2>

          <CalloutBox title='Placeholder callout'>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </CalloutBox>

          <p>Donec at eros vel lectus egestas imperdiet.</p>
        </Prose>
      </article>
    </PageShell>
  );
}
