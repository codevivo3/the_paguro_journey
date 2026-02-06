'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

// -----------------------------------------------------------------------------
// Public API: reuse the SAME top bar for in-page async actions.
// Import these in client components and call around fetch/mutations.
// -----------------------------------------------------------------------------

let activeCount = 0;
let startTimer: number | null = null;
let startTimestamp: number | null = null;

// Tuning knobs
const START_DELAY_MS = 60; // show sooner
const MIN_VISIBLE_MS = 120; // keep visible briefly, avoid feeling slow

function clearStartTimer() {
  if (startTimer != null) {
    window.clearTimeout(startTimer);
    startTimer = null;
  }
}

function scheduleStart() {
  if (startTimer != null || NProgress.isStarted()) return;

  startTimer = window.setTimeout(() => {
    startTimer = null;
    if (activeCount <= 0) return;

    // Start only once we are sure something is still loading.
    startTimestamp = Date.now();
    NProgress.start();
  }, START_DELAY_MS);
}

function finishWithMinDuration() {
  clearStartTimer();

  // If the bar never started (we were within delay), just ensure it stays stopped.
  if (!NProgress.isStarted()) {
    startTimestamp = null;
    NProgress.done(true);
    return;
  }

  const startedAt = startTimestamp ?? Date.now();
  const elapsed = Date.now() - startedAt;
  const remaining = Math.max(0, MIN_VISIBLE_MS - elapsed);

  if (remaining === 0) {
    startTimestamp = null;
    NProgress.done(true);
    return;
  }

  window.setTimeout(() => {
    // Only finish if nothing else started meanwhile.
    if (activeCount <= 0) {
      startTimestamp = null;
      NProgress.done(true);
    }
  }, remaining);
}

/** Start the global top loading bar (reference-counted). */
export function startTopProgress() {
  activeCount += 1;
  scheduleStart();
}

/** Finish the global top loading bar (reference-counted). */
export function doneTopProgress() {
  activeCount = Math.max(0, activeCount - 1);
  if (activeCount === 0) finishWithMinDuration();
}

/** Force-stop the bar immediately (use on errors / aborts). */
export function resetTopProgress() {
  activeCount = 0;
  clearStartTimer();
  startTimestamp = null;
  NProgress.done(true);
}

/**
 * Convenience helper: run an async function while showing the global top progress bar.
 * This applies the recommended start/try/catch/finally pattern in one place.
 */
export async function withTopProgress<T>(fn: () => Promise<T>): Promise<T> {
  startTopProgress();
  try {
    return await fn();
  } catch (e) {
    // Hard stop on errors so the bar never gets stuck.
    resetTopProgress();
    throw e;
  } finally {
    doneTopProgress();
  }
}

// -----------------------------------------------------------------------------
// Component: mounts once in your layout to configure and inject minimal styles.
// -----------------------------------------------------------------------------

export default function RouteTopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Configure once
    NProgress.configure({
      showSpinner: false,
      trickle: true,
      trickleSpeed: 120,
      minimum: 0.12,
      easing: 'ease',
      speed: 140,
    });
  }, []);

  // Finish the bar whenever navigation completes (pathname or querystring changed)
  useEffect(() => {
    // If nothing is active, this is a no-op. If something started, it will complete.
    doneTopProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  // Start for all internal navigations triggered by clicking links
  useEffect(() => {
    const onClickCapture = (e: MouseEvent) => {
      if (e.defaultPrevented) return;
      // Only left clicks
      if (e.button !== 0) return;
      // Ignore modified clicks (new tab, etc.)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      const a = target?.closest('a') as HTMLAnchorElement | null;
      if (!a) return;

      // Opt-out per link if needed
      if (a.dataset.noProgress === 'true') return;

      const href = a.getAttribute('href');
      if (!href) return;

      // Ignore in-page anchors and non-http intents
      if (href.startsWith('#')) return;
      if (href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (a.hasAttribute('download')) return;

      // Ignore external links
      if (href.startsWith('http') || href.startsWith('//')) {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
      }

      // Ignore new-tab / external targets
      const targetAttr = a.getAttribute('target');
      if (targetAttr && targetAttr !== '_self') return;

      startTopProgress();
    };

    document.addEventListener('click', onClickCapture, true);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
    };
  }, []);

  // Minimal NProgress CSS (so you don't have to import nprogress.css globally)
  // Color uses your CSS var: --paguro-coral
  return (
    <style>{`
      /* Make clicks still work (nprogress sets pointer-events:none) */
      #nprogress { pointer-events: none; }
      #nprogress .bar {
        background: var(--paguro-coral, #4F8EF7);
        position: fixed;
        z-index: 9999;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
      }
      #nprogress .peg {
        display: block;
        position: absolute;
        right: 0;
        width: 100px;
        height: 100%;
        box-shadow: 0 0 10px var(--paguro-coral, #4F8EF7), 0 0 5px var(--paguro-coral, #4F8EF7);
        opacity: 1;
        transform: rotate(3deg) translate(0px, -4px);
      }
      /* Disable the spinner entirely */
      #nprogress .spinner { display: none; }
    `}</style>
  );
}
