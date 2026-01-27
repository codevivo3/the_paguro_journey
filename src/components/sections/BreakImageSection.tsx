import Image from 'next/image';

type BreakImageSectionProps = {
  /**
   * Absolute URL or relative URL that Next/Image can resolve.
   * (For Sanity images you’ll typically pass a built URL from your url builder.)
   */
  src: string;
  alt: string;
  caption?: string;
  href?: string;
  priority?: boolean;
  className?: string;

  /**
   * Optional metadata (editorial / analytics / Sanity-friendly)
   */
  meta?: {
    id?: string;
    type?: 'mediaItem' | 'image' | 'photo';
    title?: string;
    credit?: string;
  };
};

export default function BreakImageSection({
  src,
  alt,
  caption,
  href,
  priority = false,
  className,
  meta,
}: BreakImageSectionProps) {
  const content = (
    <figure
      data-id={meta?.id}
      data-type={meta?.type}
      data-title={meta?.title}
      data-credit={meta?.credit}
      className={[
        'relative overflow-hidden rounded-sm',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className='relative aspect-[16/9] overflow-hidden rounded-sm'>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className='object-cover'
          sizes='(max-width: 1024px) 100vw, 768px'
        />
      </div>

      {caption ? (
        <figcaption className='t-meta mt-3'>
          {caption}
        </figcaption>
      ) : null}

      {meta?.credit ? (
        <div className='t-meta mt-1 text-xs'>
          © {meta.credit}
        </div>
      ) : null}
    </figure>
  );

  return (
    <section className='mx-auto w-full max-w-3xl py-10'>
      {href ? (
        <a
          href={href}
          className='block outline-none focus-visible:ring-1 focus-visible:ring-white/50'
          aria-label={caption ? `Open: ${caption}` : 'Open image link'}
        >
          {content}
        </a>
      ) : (
        content
      )}
    </section>
  );
}