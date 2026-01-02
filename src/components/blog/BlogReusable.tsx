// src/components/blog/BlogReusable.tsx
import Image from 'next/image';

type ClassValue = string | undefined | null | false;

/** Small helper to join classNames safely */
export function cx(...classes: ClassValue[]) {
  return classes.filter(Boolean).join(' ');
}

/* -------------------------------------------------------------------------- */
/* Wrappers                                                                    */
/* -------------------------------------------------------------------------- */

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cx('px-6 pb-24 pt-28', className)}>
      <div className='mx-auto max-w-5xl'>{children}</div>
    </main>
  );
}

/** One place to control blog typography */
export function Prose({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        // keep it simple: readability first
        'mx-auto max-w-3xl text-[color:var(--paguro-text-dark)]',
        'leading-relaxed',
        className
      )}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Article header                                                              */
/* -------------------------------------------------------------------------- */

export function ArticleHeader({
  title,
  date,
  eyebrow,
  className,
}: {
  title: string;
  date?: string;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <header className={cx('mx-auto max-w-3xl space-y-3', className)}>
      {eyebrow && (
        <p className='[font-family:var(--font-ui)] text-sm uppercase tracking-wide text-[color:var(--paguro-text-dark)]/60'>
          {eyebrow}
        </p>
      )}

      <h1 className='[font-family:var(--font-editorial)] text-4xl sm:text-5xl font-semibold text-[color:var(--paguro-text-dark)]'>
        {title}
      </h1>

      {date && (
        <p className='text-sm text-[color:var(--paguro-text-dark)]/60'>
          {date}
        </p>
      )}
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Media                                                                       */
/* -------------------------------------------------------------------------- */

export function CoverMedia({
  src,
  alt,
  className,
  priority,
}: {
  src?: string; // optional on purpose
  alt?: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) return null;

  return (
    <div className={cx('mx-auto mt-8 max-w-5xl', className)}>
      <div className='relative aspect-[16/9] overflow-hidden rounded-2xl bg-black/5'>
        <Image
          src={src}
          alt={alt ?? ''}
          fill
          priority={priority}
          className='object-cover'
          sizes='(max-width: 1024px) 100vw, 1024px'
        />
      </div>
    </div>
  );
}

export function GalleryImage({
  src,
  alt,
  className,
}: {
  src?: string; // optional so you can render conditionally
  alt?: string;
  className?: string;
}) {
  if (!src) return null;

  return (
    <div
      className={cx(
        'relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/5',
        className
      )}
    >
      <Image
        src={src}
        alt={alt ?? ''}
        fill
        className='object-cover'
        sizes='(max-width: 768px) 100vw, 33vw'
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* UI blocks                                                                   */
/* -------------------------------------------------------------------------- */

export function CalloutBox({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cx(
        'mx-auto max-w-3xl rounded-2xl border border-black/10 bg-[color:var(--paguro-ivory)] p-5',
        className
      )}
    >
      {title && (
        <p className='[font-family:var(--font-ui)] font-semibold text-[color:var(--paguro-text-dark)]'>
          {title}
        </p>
      )}
      <div
        className={cx(
          title ? 'mt-2' : '',
          'text-[color:var(--paguro-text-dark)]/80'
        )}
      >
        {children}
      </div>
    </aside>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx('my-10 border-black/10', className)} />;
}
