'use client'

/**
 * This route is responsible for the built-in authoring environment using Sanity Studio.
 * All routes under your studio path is handled by this file using Next.js' catch-all routes:
 * https://nextjs.org/docs/routing/dynamic-routes#catch-all-routes
 *
 * You can learn more about the next-sanity package here:
 * https://github.com/sanity-io/next-sanity
 */

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { NextStudioProps } from 'next-sanity/studio';
import config from '../../../../sanity.config';

const NextStudioNoSSR = dynamic<NextStudioProps>(
  () => import('next-sanity/studio').then((m) => m.NextStudio),
  { ssr: false },
);

export default function StudioPage() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Sanity Studio (and @sanity/ui) can emit validateDOMNesting warnings in dev
    // (e.g. <div> inside <p>) that trigger the Next.js dev overlay.
    // Suppress only these specific warnings to keep the Studio usable.
    const restoreConsoleError = console.error;

    const originalConsoleError = console.error.bind(console) as (
      ...args: unknown[]
    ) => void;

    console.error = (...args: unknown[]) => {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : ''))
        .join(' ')
        .toLowerCase();

      const isNestingWarning =
        msg.includes('cannot be a descendant of') ||
        msg.includes('cannot contain a nested') ||
        msg.includes('validatedomnesting') ||
        msg.includes('hydration error');

      if (isNestingWarning) return;

      originalConsoleError(...args);
    };

    const isAbortLike = (err: unknown, msg?: string) => {
      const anyErr = err as { name?: string; code?: string; message?: string } | null;
      const m = (msg || anyErr?.message || '').toString().toLowerCase();
      const n = anyErr?.name || '';
      const c = anyErr?.code || '';
      return (
        n === 'AbortError' ||
        c === 'UND_ERR_ABORTED' ||
        m.includes('signal is aborted') ||
        m.includes('aborterror')
      );
    };

    const onError = (e: ErrorEvent) => {
      if (isAbortLike(e.error, e.message)) {
        e.preventDefault();
        return false;
      }
      return undefined;
    };

    const onRejection = (e: PromiseRejectionEvent) => {
      if (isAbortLike(e.reason)) {
        e.preventDefault();
        return false;
      }
      return undefined;
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);

    return () => {
      console.error = restoreConsoleError;
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return <NextStudioNoSSR config={config} />
}
