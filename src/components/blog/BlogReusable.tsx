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
        'prose mx-auto max-w-3xl text-[color:var(--paguro-text)] prose-p:text-[color:var(--paguro-text-muted)] leading-relaxed',
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
        <p className='t-meta uppercase tracking-wide'>
          {eyebrow}
        </p>
      )}

      <h1 className='t-page-title'>
        {title}
      </h1>

      {date && (
        <p className='t-meta'>
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
    <div className={cx('mx-auto mt-8 max-w-3xl', className)}>
      <div className='relative aspect-[16/9] overflow-hidden rounded-sm [font-family:var(--font-ui)]'>
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
        'relative aspect-[16/9] overflow-hidden rounded-sm bg-[color:var(--paguro-surface)]',
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
        'mx-auto my-3 max-w-3xl rounded-sm border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)] p-5',
        className
      )}
    >
      {title && (
        <p className='t-section-title'>
          {title}
        </p>
      )}
      <div className='t-body'>
        {children}
      </div>
    </aside>
  );
}

export function Divider({ className }: { className?: string }) {
  return <hr className={cx('my-10 border-[color:var(--paguro-border)]', className)} />;
}
