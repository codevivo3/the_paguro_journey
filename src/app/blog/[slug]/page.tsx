import { posts } from '@/lib/posts';

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

  // Main content wrapper
  return (
    <main className='pt-24'>
      {/* Blog post article */}
      <article>
        {/* Article header with title and date */}
        <header>
          <h1>{post.title}</h1>
          <p>Published on — date placeholder</p>
        </header>

        {/* Article body section */}
        <section>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </section>
      </article>
    </main>
  );
}
