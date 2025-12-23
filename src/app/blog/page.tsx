import Link from 'next/link';
import Image from 'next/image';

// Temporary local data (later this will come from Sanity)
const posts = [
  {
    slug: 'slow-travel-thailand',
    title: 'Slow Travel in Thailand',
    excerpt: 'A reflection on traveling with intention.',
  },
  {
    slug: 'off-the-beaten-path-greece',
    title: 'Off the Beaten Path in Greece',
    excerpt: 'Discovering quieter islands and local life.',
  },
  {
    slug: 'sustainable-travel-basics',
    title: 'Sustainable Travel Basics',
    excerpt: 'Simple principles for traveling responsibly.',
  },
];

// Blog index page → /blog
export default function BlogPage() {
  return (
    <main className='px-6 pb-16 pt-28'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page intro */}
        <header className='text-center space-y-3'>
          <h1 className='[font-family:var(--font-ui)] text-4xl font-semibold text-[color:var(--paguro-text-dark)]'>
            Blog
          </h1>
          <p className='mx-auto max-w-2xl text-[color:var(--paguro-text-dark)]/75'>
            Stories, reflections, and guides about mindful travel and
            off-the-beaten-path destinations.
          </p>
        </header>

        {/* Posts grid */}
        <section aria-label='Latest Articles' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
              Blogs
            </h2>
            <span className='text-sm text-[color:var(--paguro-text-dark)]/60'>
              {posts.length} posts
            </span>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.slug}
                className='group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
              >
                <Link href={`/blog/${post.slug}`} className='block'>
                  {/* Thumbnail placeholder (replace with CMS image later) */}
                  <div className='relative aspect-video w-full bg-black/10'>
                    <Image
                      src='/placeholder_view_vector.png'
                      alt=''
                      fill
                      sizes='(max-width: 1024px) 100vw, 33vw'
                      className='object-cover'
                      priority={false}
                    />
                  </div>

                  <div className='p-6 space-y-3'>
                    <h3 className='[font-family:var(--font-ui)] text-xl font-semibold text-[color:var(--paguro-text-dark)]'>
                      {post.title}
                    </h3>

                    <p className='text-[color:var(--paguro-text-dark)]/75'>
                      {post.excerpt}
                    </p>

                    <div className='pt-2'>
                      <span className='inline-flex items-center gap-2 text-[color:var(--paguro-deep)] font-medium transition-colors duration-200 group-hover:text-[color:var(--paguro-coral)]'>
                        Read article <span aria-hidden='true'>➜</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
