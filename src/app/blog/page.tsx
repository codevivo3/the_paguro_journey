import Image from 'next/image';

import { posts } from '@/lib/posts';

import {
  Card,
  CardMedia,
  CardBody,
  CardTitle,
  CardText,
} from '@/components/ui/Card';

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
              <Card
                key={post.slug}
                href={`/blog/${post.slug}`}
                ariaLabel={`Apri articolo: ${post.title}`}
              >
                <CardMedia className='aspect-video'>
                  <Image
                    src={post.coverImage || '/world-placeholder.png'}
                    alt={post.title}
                    fill
                    sizes='(max-width: 1024px) 100vw, 33vw'
                    className='object-cover'
                  />
                </CardMedia>

                <CardBody>
                  <CardTitle>{post.title}</CardTitle>
                  <CardText>{post.excerpt}</CardText>

                  <div className='mt-auto pt-4 text-sm font-medium text-[color:var(--paguro-link)] transition-colors duration-200 group-hover:text-[color:var(--paguro-link-hover)]'>
                    Leggi l&apos;articolo <span aria-hidden>➜</span>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
