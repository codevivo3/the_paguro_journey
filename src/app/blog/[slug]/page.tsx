import { posts } from '@/lib/posts';
import { notFound } from 'next/navigation';

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

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <PageShell className='pb-16 pt-24'>
      <article className='space-y-10'>
        <ArticleHeader title={post.title} date={post.date} />

        <CoverMedia
          src={post.coverImage || '/world-placeholder.png'}
          alt={post.title}
          priority
        />

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
          <GalleryImage src={post.gallery?.[0]} alt={post.title} />
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
          <GalleryImage src={post.gallery?.[1]} alt={post.title} />
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
