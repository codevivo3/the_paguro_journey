import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { posts } from '@/lib/posts';
import { resolvePostCoverImage } from '@/lib/posts-media';
import { Masonry, MasonryItem } from '@/components/ui/Masonry';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Racconti di viaggio, riflessioni e guide pratiche per un viaggio consapevole e lontano dai percorsi più battuti.',
  alternates: {
    canonical: '/blog',
  },
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

export default function BlogPage() {
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
              const cover = resolvePostCoverImage(post);

              // Orientation first, fallback to your “rhythm” layout
              const mediaAspect =
                cover.orientation === 'portrait'
                  ? 'aspect-[3/4]'
                  : cover.orientation === 'landscape'
                  ? 'aspect-video'
                  : index % 5 === 0
                  ? 'aspect-[4/5]'
                  : index % 3 === 0
                  ? 'aspect-[3/4]'
                  : 'aspect-video';

              const alt = cover.alt ?? post.title;

              return (
                <MasonryItem key={post.slug}>
                  <Card>
                    <Link
                      href={`/blog/${post.slug}`}
                      aria-label={`Apri articolo: ${post.title}`}
                      className='block'
                    >
                      <CardMedia className={mediaAspect}>
                        <Image
                          src={cover.src}
                          alt={alt}
                          fill
                          sizes='(max-width: 1024px) 100vw, 33vw'
                          className='object-cover transition-transform duration-300 hover:scale-[1.02]'
                        />
                      </CardMedia>
                    </Link>

                    <CardBody>
                      <CardTitle>{post.title}</CardTitle>
                      <CardText>{post.excerpt}</CardText>
                      <Link
                        href={`/blog/${post.slug}`}
                        aria-label={`Leggi l'articolo: ${post.title}`}
                        className='mt-auto inline-flex items-center gap-2 pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 hover:text-[color:var(--paguro-link-hover)]'
                      >
                        Leggi l&apos;articolo <span aria-hidden>➜</span>
                      </Link>
                    </CardBody>
                  </Card>
                </MasonryItem>
              );
            })}
          </Masonry>
        </section>
      </div>
    </main>
  );
}
