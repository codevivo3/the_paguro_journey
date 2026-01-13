'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

type Fades = {
  showLeft: boolean;
  showRight: boolean;
};

export function useCarouselFades(
  scrollerRef: React.RefObject<HTMLDivElement | null>
) {
  const [fades, setFades] = useState<Fades>({
    showLeft: false,
    showRight: false,
  });

  const recalc = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const atStart = el.scrollLeft <= 8;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 24;

    const next: Fades = { showLeft: !atStart, showRight: !atEnd };

    // Avoid pointless re-renders
    setFades((prev) =>
      prev.showLeft === next.showLeft && prev.showRight === next.showRight
        ? prev
        : next
    );
  }, [scrollerRef]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    // initial calc (after mount)
    recalc();

    const onScroll = () => recalc();
    const onResize = () => recalc();

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, [recalc, scrollerRef]);

  const fadeClass = useMemo(
    () => ({
      left: fades.showLeft ? 'opacity-100' : 'opacity-0',
      right: fades.showRight ? 'opacity-100' : 'opacity-0',
    }),
    [fades]
  );

  return { fadeClass, recalc };
}
