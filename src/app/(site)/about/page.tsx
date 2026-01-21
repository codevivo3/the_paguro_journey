import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import Button from '@/components/ui/Button';

// Sanity (single source of truth for images)
import { client } from '@/sanity/lib/client';
import { urlFor } from '@/sanity/lib/image';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Fetch About image from Site Settings (single source of truth)
const ABOUT_IMAGE_QUERY = /* groq */ `
  *[_type == "siteSettings"][0]{
    "aboutImage": aboutImage->{
      alt,
      caption,
      "image": image.asset
    }
  }
`;

async function getAboutImageFromSanity(): Promise<{
  src: string;
  alt: string;
  caption?: string;
} | null> {
  const data = await client.fetch<{
    aboutImage?: {
      alt?: string;
      caption?: string;
      image?: SanityImageSource;
    };
  } | null>(ABOUT_IMAGE_QUERY);

  const img = data?.aboutImage;
  if (!img?.image) return null;

  const src =
    urlFor(img.image).width(1600).height(900).fit('crop').url() ?? null;

  if (!src) return null;

  return {
    src,
    alt: img.alt ?? 'Valentina e Mattia in un paesaggio naturale',
    caption: img.caption,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const aboutImage = await getAboutImageFromSanity();

  return {
    title: 'Chi siamo | The Paguro Journey',
    description:
      'Scopri chi siamo e la storia dietro The Paguro Journey: un progetto di viaggio consapevole tra racconti, video e destinazioni lontane dai percorsi più battuti.',
    alternates: {
      canonical: '/about',
    },
    openGraph: {
      title: 'Chi siamo | The Paguro Journey',
      description:
        'La storia dietro The Paguro Journey e i valori che guidano il nostro modo di viaggiare.',
      url: '/about',
      type: 'website',
      images: [
        {
          url: aboutImage?.src ?? '/destinations/images/about/about-pic.jpg',
          width: 1200,
          height: 675,
          alt: aboutImage?.alt ?? 'Valentina e Mattia in un paesaggio naturale',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Chi siamo | The Paguro Journey',
      description:
        'La storia dietro The Paguro Journey e i valori che guidano il nostro modo di viaggiare.',
      images: [aboutImage?.src ?? '/destinations/images/about/about-pic.jpg'],
    },
  };
}

export default async function AboutPage() {
  // Source-of-truth image comes from Sanity (fallback keeps the page resilient).
  const aboutImage = await getAboutImageFromSanity();

  const imgSrc = aboutImage?.src ?? '/about-pic.jpg';
  const imgAlt =
    aboutImage?.alt ?? 'Valentina e Mattia in un paesaggio naturale';

  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-3xl space-y-10'>
        {/* Header: page title + short value proposition */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>Chi siamo</h1>
          <p className='t-page-subtitle'>
            La storia dietro The Paguro Journey e i valori che guidano il nostro
            modo di viaggiare.
          </p>
        </header>
        <figure className='mx-auto max-w-3xl'>
          <div className='relative aspect-[16/9] overflow-hidden rounded-sm '>
            <Image
              src={imgSrc}
              alt={imgAlt}
              fill
              className='object-cover'
              sizes='(max-width: 1024px) 100vw, 768px'
              priority
            />
          </div>

          {aboutImage?.caption && (
            <figcaption className='t-meta mt-3'>
              {aboutImage.caption}
            </figcaption>
          )}
        </figure>

        {/* Main content: editorial copy (kept as prose for readability) */}
        <section className='prose max-w-none text-[color:var(--paguro-text)] prose-p:text-[color:var(--paguro-text-muted)] prose-li:text-[color:var(--paguro-text-muted)] prose-blockquote:text-[color:var(--paguro-text-muted)] prose-a:text-[color:var(--paguro-deep)] hover:prose-a:text-[color:var(--paguro-coral)]'>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            lacinia odio vitae vestibulum vestibulum. Cras venenatis euismod
            malesuada.
          </p>
          <br />
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo.
          </p>
          <br />
          <p>
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
            fugit, sed quia consequuntur magni dolores eos qui ratione
            voluptatem sequi nesciunt.
          </p>
        </section>

        {/* CTA: drive readers to the Blog */}
        <section className='mt-16 rounded-sm bg-[color:var(--paguro-surface)] p-8 text-center'>
          <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
            Continua il viaggio
          </h2>
          <p className='mt-2 t-body'>
            Scopri i racconti, i video e le destinazioni che hanno dato forma a
            questo progetto.
          </p>
          <div className='mt-6'>
            <Button href='/blog' className='text-white'>
              Vai al blog <span aria-hidden='true'>➜</span>
            </Button>
          </div>
        </section>

        {/* Secondary CTA: Media Kit for collaborations */}
        <section className='text-center'>
          <p className='t-body'>
            Per collaborazioni, stampa e partnership puoi consultare il nostro{' '}
            <Link
              href='/media-kit'
              className='font-semibold transition-colors hover:text-[color:var(--paguro-coral)]'
            >
              Media Kit ➜
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
