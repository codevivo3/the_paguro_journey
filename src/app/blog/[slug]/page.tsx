import { posts } from '@/lib/posts';
import Image from 'next/image';
import Link from 'next/link';

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
      <div className='mx-auto max-w-6xl'>
        {/* Blog post article */}
        <article className='space-y-10 text-lg md:text-xl'>
          {/* Article header */}
          <header className='space-y-3'>
            <h1 className='[font-family:var(--font-ui)] text-5xl font-semibold text-[color:var(--paguro-text-dark)]'>
              {post.title}
            </h1>
            <p className='text-2xl text-[color:var(--paguro-text-dark)]/60'>
              Published on — date placeholder
            </p>
          </header>

          {/* Hero / cover placeholder (future CMS image) */}
          {(() => {
            const cover = (
              <div className='relative aspect-video overflow-hidden rounded-2xl bg-black/10'>
                <Image
                  src={post.imageUrl1 || '/placeholder_view_vector.png'}
                  alt={post.title}
                  fill
                  className='object-cover'
                  priority
                />
              </div>
            );

            // `Link`'s href can't be undefined. If there's no link yet, just render the cover.
            return post.linkAddress ? (
              <Link href={post.linkAddress}>{cover}</Link>
            ) : (
              cover
            );
          })()}

          {/* Article body */}
          <section className='prose prose-neutral max-w-none mt-8 leading-relaxed prose-p:text-[color:var(--paguro-text-dark)]/80 prose-li:text-[color:var(--paguro-text-dark)]/80 prose-headings:text-[color:var(--paguro-text-dark)] prose-headings:[font-family:var(--font-ui)]'>
            <p className='lead text-[color:var(--paguro-text-dark)]/80'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer
              non feugiat arcu. Suspendisse potenti. In hac habitasse platea
              dictumst. Curabitur finibus, eros in commodo consectetur, ipsum
              lorem dapibus orci, a viverra magna augue a augue.
            </p>

            <p>
              Praesent euismod, nibh at porta egestas, sem est lacinia nulla, in
              ullamcorper lorem tellus a justo. Sed eu magna ac orci porttitor
              gravida. Nulla facilisi. Aenean sed massa vitae sem dictum
              ullamcorper. Aliquam erat volutpat.
            </p>

            <h2 className='[font-family:var(--font-ui)] text-[color:var(--paguro-text-dark)]'>
              Lorem ipsum heading
            </h2>

            <p>
              Donec posuere, metus sit amet pulvinar blandit, arcu libero
              ullamcorper risus, a elementum elit lorem at metus. Etiam
              ullamcorper, mauris in pretium aliquet, augue justo gravida
              lectus, a pellentesque ex lectus in nibh. Duis in nibh sed libero
              varius tristique.
            </p>

            <p>
              Morbi at tortor vitae massa tristique commodo. Vestibulum ante
              ipsum primis in faucibus orci luctus et ultrices posuere cubilia
              curae; Etiam eu justo non turpis convallis pretium. Integer sed
              interdum mauris, sit amet tincidunt sem.
            </p>

            <ul>
              <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</li>
              <li>
                Sed do eiusmod tempor incididunt ut labore et dolore magna
                aliqua.
              </li>
              <li>
                Ut enim ad minim veniam, quis nostrud exercitation ullamco
                laboris.
              </li>
            </ul>

            <p>
              Quisque ac elit vel justo faucibus consequat. Phasellus vitae
              sagittis ipsum. Proin id neque ut justo sodales pellentesque.
              Aenean laoreet, erat eu elementum fermentum, est neque porta
              turpis, sed laoreet justo mauris a lorem.
            </p>

            <blockquote>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
                at sapien sed magna placerat luctus.
              </p>
            </blockquote>

            <p>
              Integer euismod porta ipsum, vitae ultrices arcu. Nam a massa
              pharetra, viverra dolor a, bibendum nulla. Pellentesque habitant
              morbi tristique senectus et netus et malesuada fames ac turpis
              egestas.
            </p>
          </section>

          {/* Additional image */}
          <div className='relative aspect-video overflow-hidden rounded-2xl bg-black/10'>
            <Image
              src={post.imageUrl2 || '/placeholder_view_vector.png'}
              alt={post.title}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Article body continued */}
          <section className='prose prose-neutral max-w-none mt-8 leading-relaxed prose-p:text-[color:var(--paguro-text-dark)]/80 prose-li:text-[color:var(--paguro-text-dark)]/80 prose-headings:text-[color:var(--paguro-text-dark)] prose-headings:[font-family:var(--font-ui)]'>
            <h2 className='[font-family:var(--font-ui)] text-[color:var(--paguro-text-dark)]'>
              Lorem ipsum: section two
            </h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              sollicitudin, augue non bibendum feugiat, nulla lorem sodales
              justo, vitae porttitor magna erat a ligula. Duis ut nulla sed
              neque tincidunt elementum.
            </p>

            <p>
              Sed sit amet metus sed massa vulputate malesuada. Mauris sed
              sagittis lorem. Donec aliquet, nibh sed congue varius, arcu enim
              tempor felis, sit amet cursus arcu magna quis leo. Integer
              condimentum porta dui, vitae volutpat felis.
            </p>

            <p>
              Nunc vel sapien non dolor pellentesque dictum. Cras commodo
              scelerisque sem, in facilisis mi. Nam sed nisl non neque
              ullamcorper euismod. Suspendisse vitae lacus sed neque ornare
              fermentum.
            </p>

            <h3 className='[font-family:var(--font-ui)] text-[color:var(--paguro-text-dark)]'>
              A smaller subheading
            </h3>

            <p>
              Vestibulum ante ipsum primis in faucibus orci luctus et ultrices
              posuere cubilia curae; Donec ut eros et lorem posuere feugiat.
              Integer porta, lorem vitae viverra pellentesque, justo magna
              bibendum magna, a pulvinar magna nulla sed est.
            </p>

            <p>
              Curabitur ac nibh non arcu imperdiet luctus. Nulla facilisi.
              Vivamus in ipsum sed arcu pretium finibus. Phasellus tristique
              lectus in odio tempus, sit amet posuere nisl vulputate.
            </p>
          </section>

          {/* Additional image */}
          <div className='relative aspect-video overflow-hidden rounded-2xl bg-black/10'>
            <Image
              src={post.imageUrl3 || '/placeholder_view_vector.png'}
              alt={post.title}
              fill
              className='object-cover'
              priority
            />
          </div>

          {/* Article body continued */}
          <section className='prose prose-neutral max-w-none mt-8 leading-relaxed prose-p:text-[color:var(--paguro-text-dark)]/80 prose-li:text-[color:var(--paguro-text-dark)]/80 prose-headings:text-[color:var(--paguro-text-dark)] prose-headings:[font-family:var(--font-ui)]'>
            <h2 className='[font-family:var(--font-ui)] text-[color:var(--paguro-text-dark)]'>
              Lorem ipsum: section three
            </h2>

            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam
              eu nunc sed mauris feugiat tincidunt. Fusce vitae ante sed risus
              porta faucibus. Nullam quis orci sit amet velit elementum
              pulvinar.
            </p>

            <p>
              Pellentesque habitant morbi tristique senectus et netus et
              malesuada fames ac turpis egestas. Nam blandit tellus nec augue
              pretium, sit amet pretium leo viverra. Proin at elit sed mi
              iaculis egestas.
            </p>

            <div className='not-prose rounded-2xl border border-black/10 bg-white/60 p-6'>
              <p className='[font-family:var(--font-ui)] text-lg font-semibold text-[color:var(--paguro-text-dark)]'>
                Placeholder callout
              </p>
              <p className='mt-2 text-[color:var(--paguro-text-dark)]/70'>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                vitae turpis at orci porta sollicitudin. (This is only to test a
                “note box” style in a long article.)
              </p>
            </div>

            <p>
              Integer non lectus sit amet lorem convallis gravida. Sed viverra
              ante vitae quam tristique, vitae gravida sem tristique. Etiam
              vitae nisl vel leo consequat vehicula. Morbi luctus lacus vel
              lectus scelerisque, at tempus erat volutpat.
            </p>

            <p>
              Donec at eros vel lectus egestas imperdiet. Maecenas at justo
              metus. In non nulla vitae purus faucibus egestas. Morbi sed
              dignissim nibh. Praesent molestie, mauris at ultricies tristique,
              metus lacus finibus mi, non tincidunt nisi leo a orci.
            </p>
          </section>
        </article>
      </div>
    </main>
  );
}
