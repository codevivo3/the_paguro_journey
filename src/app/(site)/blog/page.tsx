// src/app/(site)/blog/page.tsx
import type { Metadata } from 'next';

import { Masonry, MasonryItem } from '@/components/ui/Masonry';
import BlogCardClient from '@/components/features/blog/BlogCardClient';

import { getBlogPostsForIndex } from '@/sanity/queries/blog';
import { urlFor } from '@/sanity/lib/image';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Racconti di viaggio, riflessioni e guide pratiche per un viaggio consapevole e lontano dai percorsi più battuti.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Blog | The Paguro Journey',
    description:
      'Racconti di viaggio, riflessioni e guide pratiche per un viaggio consapevole e lontano dai percorsi più battuti.',
    url: '/blog',
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
    title: 'Blog | The Paguro Journey',
    description:
      'Racconti di viaggio, riflessioni e guide pratiche per un viaggio consapevole e lontano dai percorsi più battuti.',
    images: ['/og-default.jpg'],
  },
};

// Fallback if post has no cover in Sanity
const BLOG_PLACEHOLDER_COVER = '/og-default.jpg';

export default async function BlogPage() {
  const posts = await getBlogPostsForIndex();

  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        <header className='space-y-3'>
          <h1 className='t-page-title'>Blog</h1>
          <p className='t-page-subtitle'>
            Racconti, riflessioni e guide per un viaggio consapevole, lontano
            dai percorsi più battuti.
          </p>
        </header>

        <section aria-label='Latest Articles' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Pubblicazioni Recenti</h2>
            <span className='t-meta'>{posts.length} articoli</span>
          </div>

          <Masonry>
            {posts.map((post, index) => {
              // Resolve Sanity image to URL (if present)
              const coverSrc = post.coverImage
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

              return (
                <MasonryItem key={post._id}>
                  <BlogCardClient
                    href={`/blog/${post.slug}`}
                    title={post.title}
                    excerpt={post.excerpt ?? ''}
                    coverSrc={coverSrc}
                    mediaAspect={mediaAspect}
                    ariaLabel={`Apri articolo: ${post.title}`}
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
