import Link from 'next/link';
import Image from 'next/image';

import { posts } from '@/lib/posts';

// Blog index page → /blog
export default function BlogPage() {
  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Page intro */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Blog</h1>
          <p className='t-page-subtitle'>
            Racconti, riflessioni e guide per un viaggio consapevole, lontano
            dai percorsi più battuti.
          </p>
        </header>

        {/* Posts grid */}
        <section aria-label='Latest Articles' className='space-y-5'>
          <div className='flex items-baseline justify-between'>
            <h2 className='t-section-title'>Pubblicazioni Recenti</h2>
            <span className='t-meta'>{posts.length} articoli</span>
          </div>

          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {posts.map((post) => (
              <article
                key={post.slug}
                className='group overflow-hidden rounded-2xl border border-black/10 bg-[color:var(--paguro-ivory)] shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg'
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className='flex h-full flex-col'
                >
                  {/* Cover image (local now, later from Sanity) */}
                  <div className='relative aspect-video w-full bg-black/10'>
                    <Image
                      src={post.coverImage || '/world-placeholder.png'}
                      alt={post.title}
                      fill
                      sizes='(max-width: 1024px) 100vw, 33vw'
                      className='object-cover'
                      priority={false}
                    />
                  </div>

                  <div className='flex flex-1 flex-col gap-3 p-6'>
                    <h3 className='t-card-title'>{post.title}</h3>

                    <p className='t-card-body'>{post.excerpt}</p>

                    <div className='mt-auto pt-4'>
                      <span className='t-meta text-sm inline-flex items-center gap-2 text-[color:var(--paguro-deep)] font-medium transition-colors duration-200 group-hover:text-[color:var(--paguro-coral)]'>
                        Leggi l&apos;articolo <span aria-hidden='true'>➜</span>
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
