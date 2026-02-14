import type { HomeIntroData } from '@/sanity/queries/homeIntro';

import RichText from '@/components/shared/RichText';
import { safeLang, type Lang } from '@/lib/route';

import type { PortableTextBlock } from '@portabletext/types';

type IntroSectionProps = {
  /** Active language (used only for fallback content) */
  lang?: Lang;

  /** Optional Sanity payload (headlineI18n/headlineResolved + introI18n/introResolved) */
  data?: HomeIntroData;

  /** If provided, overrides the fallback headline (Sanity-wired: homeHeroHeadline) */
  title?: string | null;

  /**
   * Sanity-wired intro body (homeIntro) uses Portable Text.
   * Pass the localized array of blocks here.
   */
  body?: PortableTextBlock[] | null;
};

export default function IntroSection({
  lang,
  data,
  title,
  body,
}: IntroSectionProps) {
  const effectiveLang: Lang = safeLang(lang);

  const fallbackCopy = {
    it: {
      title: 'Scopriamo il mondo insieme',
      body: 'Viaggiamo per il mondo alla ricerca di luoghi autentici, remoti e ancora veri. Crediamo che il turismo di massa stia cancellando la magia della scoperta, e che viaggiare significhi molto più che spuntare una lista di luoghi “instagrammabili”. Nei nostri video raccontiamo storie reali, incontri, avventure e paesaggi che resistono alle mode. Il nostro obiettivo è ispirare chi viaggia a farlo con curiosità, rispetto e consapevolezza, per scoprire il mondo senza rovinarlo. Scopri il lato autentico del viaggio. <br /> Valentina & Mattia',
    },
    en: {
      title: 'Let’s discover the world together',
      body: 'We travel the world in search of places that are authentic, remote, and still untouched. <br /> We believe mass tourism is slowly erasing the magic of discovery — and that travel means far more than ticking off a list of “Instagrammable” spots. <br /> Through our videos, we share real stories, encounters, adventures, and landscapes that resist trends and passing hype. <br /> Our goal is to inspire people to travel with curiosity, respect, and awareness, to discover the world without destroying it. <br /> Discover the authentic side of travel. <br /> Valentina & Mattia',
    },
  } as const;

  const fallback = fallbackCopy[effectiveLang];

  // Prefer explicit props, otherwise use Sanity-resolved fields, otherwise fallback copy.
  const sanityTitle = data?.headlineResolved ?? null;
  const sanityBody = data?.introResolved ?? null;

  const resolvedTitle = title?.trim()
    ? title
    : sanityTitle?.trim()
      ? sanityTitle
      : fallback.title;

  const resolvedBody =
    Array.isArray(body) && body.length > 0 ? body : sanityBody;

  // Portable Text arrays come through as arrays; anything else falls back to plain copy.
  const isPortableText = Array.isArray(resolvedBody) && resolvedBody.length > 0;

  // Intentionally split title so the last word stays on its own line
  const titleWords = resolvedTitle.trim().split(' ');
  const lastWord =
    titleWords.length > 1 ? titleWords[titleWords.length - 1] : null;
  const firstPart =
    titleWords.length > 1 ? titleWords.slice(0, -1).join(' ') : resolvedTitle;

  return (
    <section className='relative overflow-hidden bg-[color:var(--paguro-bg)] py-10 md:py-16'>
      {/* Decorative Haikei SVG */}
      <svg
        className="pointer-events-none absolute left-0 top-0 z-0 block h-28 md:h-40 w-full opacity-75 [html[data-theme='dark']_&]:hidden"
        viewBox='0 0 960 540'
        preserveAspectRatio='none'
        fill='none'
      >
        <defs>
          <linearGradient
            id='paguroFadeVertical'
            x1='0%'
            y1='0%'
            x2='0%'
            y2='100%'
          >
            <stop offset='0%' stopColor='white' stopOpacity='1' />
            <stop offset='50%' stopColor='white' stopOpacity='1' />
            <stop offset='90%' stopColor='white' stopOpacity='0' />
          </linearGradient>
          <mask id='paguroFadeMask'>
            <rect width='960' height='540' fill='url(#paguroFadeVertical)' />
          </mask>
        </defs>
        <path
          mask='url(#paguroFadeMask)'
          d='M0 104L14.5 106.7C29 109.3 58 114.7 87.2 112.8C116.3 111 145.7 102 174.8 100.2C204 98.3 233 103.7 262 106.3C291 109 320 109 349 98.2C378 87.3 407 65.7 436.2 72C465.3 78.3 494.7 112.7 523.8 116.3C553 120 582 93 611 88.5C640 84 669 102 698 107.3C727 112.7 756 105.3 785.2 94.5C814.3 83.7 843.7 69.3 872.8 73.8C902 78.3 931 101.7 945.5 113.3L960 125L960 0L945.5 0C931 0 902 0 872.8 0C843.7 0 814.3 0 785.2 0C756 0 727 0 698 0C669 0 640 0 611 0C582 0 553 0 523.8 0C494.7 0 465.3 0 436.2 0C407 0 378 0 349 0C320 0 291 0 262 0C233 0 204 0 174.8 0C145.7 0 116.3 0 87.2 0C58 0 29 0 14.5 0L0 0Z'
          fill='#5bc2d9'
        />
        <path
          mask='url(#paguroFadeMask)'
          d='M0 147L14.5 161.3C29 175.7 58 204.3 87.2 211.5C116.3 218.7 145.7 204.3 174.8 199.8C204 195.3 233 200.7 262 196.2C291 191.7 320 177.3 349 167.5C378 157.7 407 152.3 436.2 166.7C465.3 181 494.7 215 523.8 219.5C553 224 582 199 611 191.8C640 184.7 669 195.3 698 192.7C727 190 756 174 785.2 163.2C814.3 152.3 843.7 146.7 872.8 156.5C902 166.3 931 191.7 945.5 204.3L960 217L960 123L945.5 111.3C931 99.7 902 76.3 872.8 71.8C843.7 67.3 814.3 81.7 785.2 92.5C756 103.3 727 110.7 698 105.3C669 100 640 82 611 86.5C582 91 553 118 523.8 114.3C494.7 110.7 465.3 76.3 436.2 70C407 63.7 378 85.3 349 96.2C320 107 291 107 262 104.3C233 101.7 204 96.3 174.8 98.2C145.7 100 116.3 109 87.2 110.8C58 112.7 29 107.3 14.5 104.7L0 102Z'
          fill='#74cbc9'
        />
        <path
          mask='url(#paguroFadeMask)'
          d='M0 363L14.5 365.7C29 368.3 58 373.7 87.2 369.2C116.3 364.7 145.7 350.3 174.8 348.5C204 346.7 233 357.3 262 346.5C291 335.7 320 303.3 349 292.5C378 281.7 407 292.3 436.2 307.7C465.3 323 494.7 343 523.8 353C553 363 582 363 611 367.5C640 372 669 381 698 388.2C727 395.3 756 400.7 785.2 376.3C814.3 352 843.7 298 872.8 285.3C902 272.7 931 301.3 945.5 315.7L960 330L960 215L945.5 202.3C931 189.7 902 164.3 872.8 154.5C843.7 144.7 814.3 150.3 785.2 161.2C756 172 727 188 698 190.7C669 193.3 640 182.7 611 189.8C582 197 553 222 523.8 217.5C494.7 213 465.3 179 436.2 164.7C407 150.3 378 155.7 349 165.5C320 175.3 291 189.7 262 194.2C233 198.7 204 193.3 174.8 197.8C145.7 202.3 116.3 216.7 87.2 209.5C58 202.3 29 173.7 14.5 159.3L0 145Z'
          fill='#96d1bb'
        />
        <path
          mask='url(#paguroFadeMask)'
          d='M0 509L14.5 504.5C29 500 58 491 87.2 481C116.3 471 145.7 460 174.8 464.5C204 469 233 489 262 495.3C291 501.7 320 494.3 349 486.2C378 478 407 469 436.2 472.7C465.3 476.3 494.7 492.7 523.8 493.5C553 494.3 582 479.7 611 471.5C640 463.3 669 461.7 698 466.2C727 470.7 756 481.3 785.2 483.2C814.3 485 843.7 478 872.8 473.5C902 469 931 467 945.5 466L960 465L960 328L945.5 313.7C931 299.3 902 270.7 872.8 283.3C843.7 296 814.3 350 785.2 374.3C756 398.7 727 393.3 698 386.2C669 379 640 370 611 365.5C582 361 553 361 523.8 351C494.7 341 465.3 321 436.2 305.7C407 290.3 378 279.7 349 290.5C320 301.3 291 333.7 262 344.5C233 355.3 204 344.7 174.8 346.5C145.7 348.3 116.3 362.7 87.2 367.2C58 371.7 29 366.3 14.5 363.7L0 361Z'
          fill='#b8d5b5'
        />
        <path
          mask='url(#paguroFadeMask)'
          d='M0 541L14.5 541C29 541 58 541 87.2 541C116.3 541 145.7 541 174.8 541C204 541 233 541 262 541C291 541 320 541 349 541C378 541 407 541 436.2 541C465.3 541 494.7 541 523.8 541C553 541 582 541 611 541C640 541 669 541 698 541C727 541 756 541 785.2 541C814.3 541 843.7 541 872.8 541C902 541 931 541 945.5 541L960 541L960 463L945.5 464C931 465 902 467 872.8 471.5C843.7 476 814.3 483 785.2 481.2C756 479.3 727 468.7 698 464.2C669 459.7 640 461.3 611 469.5C582 477.7 553 492.3 523.8 491.5C494.7 490.7 465.3 474.3 436.2 470.7C407 467 378 476 349 484.2C320 492.3 291 499.7 262 493.3C233 487 204 467 174.8 462.5C145.7 458 116.3 469 87.2 479C58 489 29 498 14.5 502.5L0 507Z'
          fill='#d5d9b8'
        />
      </svg>

      <div className='relative z-10 mx-auto max-w-3xl space-y-6 px-4 md:px-6'>
        {/* Section title (uses global typography preset) */}
        <h2 className='t-page-title-intro text-[clamp(2.6rem,7vw,4.2rem)] md:text-[clamp(2.8rem,4.5vw,4.2rem)] lg:text-[clamp(2.6rem,3.8vw,4rem)] leading-tight text-center title-divider title-divider-center mt-10 md:mt-12'>
          {lastWord ? (
            <>
              <span className='block lg:whitespace-nowrap'>{firstPart}</span>
              <span className='block'>{lastWord}</span>
            </>
          ) : (
            resolvedTitle
          )}
        </h2>

        {/* Intro copy */}
        {isPortableText ? (
          <div className='t-body text-sm md:text-base text-center'>
            <RichText value={resolvedBody ?? []} />
          </div>
        ) : (
          <p className='t-body text-sm md:text-base text-center'>
            {fallback.body}
          </p>
        )}
      </div>
    </section>
  );
}
