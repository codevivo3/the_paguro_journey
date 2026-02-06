import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import Button from '@/components/ui/Button';

import { safeLang, withLangPrefix, type Lang } from '@/lib/route';
import { pickLang } from '@/lib/pickLang';
import { getAboutSettings } from '@/sanity/queries/about';
import { urlFor } from '@/sanity/lib/image';

import { PortableText } from '@portabletext/react';

type PageProps = {
  params: Promise<{ lang: Lang }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const about = await getAboutSettings(effectiveLang);
  const aboutImage = about?.image;

  const meta = {
    it: {
      title: 'Chi siamo | The Paguro Journey',
      description:
        'Scopri chi siamo e la storia dietro The Paguro Journey: un progetto di viaggio consapevole tra racconti, video e destinazioni lontane dai percorsi più battuti.',
      ogDescription:
        'La storia dietro The Paguro Journey e i valori che guidano il nostro modo di viaggiare.',
    },
    en: {
      title: 'About | The Paguro Journey',
      description:
        'Discover who we are and the story behind The Paguro Journey: a mindful travel project with stories, videos, and destinations off the beaten path.',
      ogDescription:
        'The story behind The Paguro Journey and the values that guide how we travel.',
    },
  } as const;

  const m = meta[effectiveLang];

  const ogImage = aboutImage?.image
    ? urlFor(aboutImage.image).width(1200).height(675).fit('crop').url()
    : null;

  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: withLangPrefix(effectiveLang, '/about'),
    },
    openGraph: {
      title: m.title,
      description: m.ogDescription,
      url: withLangPrefix(effectiveLang, '/about'),
      type: 'website',
      images: [
        {
          url: ogImage ?? '/destinations/images/about/about-pic.jpg',
          width: 1200,
          height: 675,
          alt:
            aboutImage?.altA11yResolved ??
            (effectiveLang === 'en'
              ? 'Valentina and Mattia in a natural landscape'
              : 'Valentina e Mattia in un paesaggio naturale'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: m.title,
      description: m.ogDescription,
      images: [ogImage ?? '/destinations/images/about/about-pic.jpg'],
    },
  };
}

export default async function AboutPage({ params }: PageProps) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

  const about = await getAboutSettings(effectiveLang);

  const fallback = {
    it: {
      h1: 'Chi siamo',
      subtitle:
        'La storia dietro The Paguro Journey e i valori che guidano il nostro modo di viaggiare.',
    },
    en: {
      h1: 'About',
      subtitle:
        'The story behind The Paguro Journey and the values that guide how we travel.',
    },
  } as const;

  const title =
    pickLang(effectiveLang, about?.title?.it, about?.title?.en) ??
    fallback[effectiveLang].h1;

  const subtitle =
    pickLang(effectiveLang, about?.subtitle?.it, about?.subtitle?.en) ??
    fallback[effectiveLang].subtitle;

  const content = pickLang(
    effectiveLang,
    about?.content?.it,
    about?.content?.en,
  );

  const cta = {
    it: {
      ctaTitle: 'Continua il viaggio',
      ctaBody:
        'Scopri i racconti, i video e le destinazioni che hanno dato forma a questo progetto.',
      ctaButton: 'Vai al blog',
    },
    en: {
      ctaTitle: 'Keep traveling',
      ctaBody:
        'Discover the stories, videos, and destinations that shaped this project.',
      ctaButton: 'Go to the blog',
    },
  } as const;

  const t = cta[effectiveLang];

  const aboutImage = about?.image;
  const imgSrc = aboutImage?.image
    ? urlFor(aboutImage.image).width(1600).height(900).fit('crop').url()
    : '/about-pic.jpg';

  const imgAlt =
    aboutImage?.altA11yResolved ??
    (effectiveLang === 'en'
      ? 'Valentina and Mattia in a natural landscape'
      : 'Valentina e Mattia in un paesaggio naturale');

  const blurDataURL = aboutImage?.blurDataURL;

  return (
    <main className='px-6 pb-16 pt-24'>
      <div className='mx-auto max-w-3xl space-y-10'>
        {/* Header: page title + short value proposition */}
        <header className='space-y-3'>
          <h1 className='t-page-title'>{title}</h1>
          <p className='t-page-subtitle'>{subtitle}</p>
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
              placeholder={blurDataURL ? 'blur' : 'empty'}
              blurDataURL={blurDataURL}
            />
          </div>

          {aboutImage?.captionResolved && (
            <figcaption className='t-meta mt-3'>
              {aboutImage.captionResolved}
            </figcaption>
          )}
        </figure>

        {/* Main content: editorial copy (kept as prose for readability) */}
        <section className='prose max-w-none text-[color:var(--paguro-text)] prose-p:text-[color:var(--paguro-text-muted)] prose-li:text-[color:var(--paguro-text-muted)] prose-blockquote:text-[color:var(--paguro-text-muted)] prose-a:text-[color:var(--paguro-deep)] hover:prose-a:text-[color:var(--paguro-coral)]'>
          {Array.isArray(content) && content.length > 0 ? (
            <PortableText value={content} />
          ) : (
            <p className='t-body'>
              {effectiveLang === 'en'
                ? 'About content is coming soon.'
                : 'Contenuto “Chi siamo” in arrivo.'}
            </p>
          )}
        </section>

        {/* CTA: drive readers to the Blog + Media Kit */}
        <section className='mt-16 rounded-sm bg-[color:var(--paguro-surface)] p-8 text-center'>
          <h2 className='[font-family:var(--font-ui)] text-2xl font-semibold text-[color:var(--paguro-text-dark)]'>
            {t.ctaTitle}
          </h2>
          <p className='mt-2 t-body'>{t.ctaBody}</p>

          <div className='mt-6'>
            <Button
              href={withLangPrefix(effectiveLang, '/blog')}
              className='text-white'
            >
              {t.ctaButton} <span aria-hidden='true'>➜</span>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
