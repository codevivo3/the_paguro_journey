import { posts } from '@/lib/posts';
import Image from 'next/image';

// `params` comes from the dynamic route `[slug]`
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

// Prebuilds static blog routes for SSG
export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// This is the dynamic blog post page
export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;

  // Matches the URL slug to post data
  const post = posts.find((p) => p.slug === slug);

  // Handles invalid or missing slugs
  if (!post) {
    return <h1>Post not found</h1>;
  }

  return (
    <main className='px-6 pb-24 pt-28'>
      <div className='mx-auto max-w-3xl'>
        {/* Blog post article */}
        <article className='space-y-10'>
          {/* Article header */}
          <header className='space-y-3'>
            <h1 className='[font-family:var(--font-ui)] text-4xl font-semibold text-[color:var(--paguro-text-dark)]'>
              {post.title}
            </h1>
            <p className='text-sm text-[color:var(--paguro-text-dark)]/60'>
              Published on — date placeholder
            </p>
          </header>

          {/* Hero / cover placeholder (future CMS image) */}
          <Image
            src='/placeholder_view_vector.png'
            alt=''
            width={1200}
            height={675}
            className='aspect-video w-full rounded-2xl bg-black/10'
            aria-hidden='true'
          />

          {/* Article body */}
          <section className='prose prose-neutral max-w-none'>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
