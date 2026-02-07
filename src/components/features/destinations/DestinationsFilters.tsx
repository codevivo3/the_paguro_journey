'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import Button from '@/components/ui/Button';
import PaguroSelect from '@/components/ui/PaguroSelect';
import { safeLang, type Lang } from '@/lib/route';

/**
 * DestinationsFilters
 *
 * This file is the *single source of truth* for Destinations filtering logic and URL state.
 * It is intentionally server-safe and framework-agnostic.
 *
 * Design goal:
 * - Keep ALL filter logic in this file.
 * - Keep the page clean: the page provides the already-fetched destinations list.
 *
 * Current filters:
 * - region
 *
 * Future-ready (already supported in parsing + href building):
 * - country
 * - style
 */

/**
 * Mirrors `searchParams` from Next.js pages.
 * Intentionally string|string[] to handle multiple query param formats.
 */
export type DestinationsSearchParams = {
  region?: string | string[];
  country?: string | string[];
  style?: string | string[];
};

/**
 * Normalized, page-level shape for a destination item.
 * This is NOT a Sanity schema and may be mapped from CMS data.
 */
export type DestinationItem = {
  slug: string;
  title: string;
  // Optional fields used by pages/cards (e.g. Sanity cover image)
  coverImage?: unknown;
  /** Display label */
  region: string;
  /** Stable slug used in URLs */
  regionSlug: string;
  /** Display label */
  country: string;
  /** Stable slug used in URLs */
  countrySlug: string;
  /**
   * Travel styles associated with this destination.
   * Option A: inferred from linked posts (distinct list).
   */
  travelStyles?: Array<{ slug: string; label: string }>;
  /** Optional: how many posts exist in this destination/country */
  count?: number;
};

export type FilterOption = { slug: string; label: string };

export type DestinationsFilterState = {
  selected: {
    region: string;
    country: string;
    style: string;
  };
  options: {
    regions: FilterOption[];
    countries: FilterOption[];
    styles: FilterOption[];
  };
  filtered: DestinationItem[];
};

function firstParam(v?: string | string[]) {
  return Array.isArray(v) ? v[0] : v;
}

function uniqOptions(items: Array<FilterOption | null | undefined>) {
  return Array.from(
    new Map(
      items
        .filter(Boolean)
        .filter((x): x is FilterOption => Boolean(x?.slug && x?.label))
        .map((x) => [x.slug, x]),
    ).values(),
  );
}

export function buildDestinationsHref(args: {
  basePath?: string;
  region?: string;
  country?: string;
  style?: string;
}) {
  const basePath = args.basePath ?? '/destinations';
  const params = new URLSearchParams();

  if (args.region) params.set('region', args.region);
  if (args.country) params.set('country', args.country);
  if (args.style) params.set('style', args.style);

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/**
 * Computes the filter state from the given destinations and search parameters.
 *
 * Inputs:
 * - destinations: full list of DestinationItem objects
 * - searchParams: optional current URL search parameters
 *
 * Outputs:
 * - selected filter values
 * - available filter options for each category
 * - filtered list of destinations matching the selected filters
 *
 * Pure and side-effect free.
 */
export function getDestinationsFilterState(
  destinations: DestinationItem[],
  searchParams?: DestinationsSearchParams,
  lang: Lang = 'it',
): DestinationsFilterState {
  const selectedRegion = (firstParam(searchParams?.region) ?? '').trim();
  const selectedCountry = (firstParam(searchParams?.country) ?? '').trim();
  const selectedStyle = (firstParam(searchParams?.style) ?? '').trim();

  const regions = uniqOptions(
    destinations.map((d) =>
      d.regionSlug && d.region ? { slug: d.regionSlug, label: d.region } : null,
    ),
  ).sort((a, b) => a.label.localeCompare(b.label, lang));

  // Countries optionally depend on the selected region (so users don't see irrelevant countries).
  const destinationsForCountries = selectedRegion
    ? destinations.filter((d) => d.regionSlug === selectedRegion)
    : destinations;

  const countries = uniqOptions(
    destinationsForCountries.map((d) =>
      d.countrySlug && d.country
        ? { slug: d.countrySlug, label: d.country }
        : null,
    ),
  ).sort((a, b) => a.label.localeCompare(b.label, lang));

  // Styles optionally depend on selected region/country (keeps the list relevant).
  const destinationsForStyles = destinations.filter((d) => {
    if (selectedRegion && d.regionSlug !== selectedRegion) return false;
    if (selectedCountry && d.countrySlug !== selectedCountry) return false;
    return true;
  });

  const styles = uniqOptions(
    destinationsForStyles.flatMap((d) =>
      (d.travelStyles ?? []).map((s) => ({ slug: s.slug, label: s.label })),
    ),
  ).sort((a, b) => a.label.localeCompare(b.label, lang));

  // Filters combined with AND logic: all selected filters must match
  const filtered = destinations.filter((d) => {
    if (selectedRegion && d.regionSlug !== selectedRegion) return false;
    if (selectedCountry && d.countrySlug !== selectedCountry) return false;
    if (selectedStyle) {
      const hasStyle = (d.travelStyles ?? []).some(
        (s) => s.slug === selectedStyle,
      );
      if (!hasStyle) return false;
    }
    return true;
  });

  return {
    selected: {
      region: selectedRegion,
      country: selectedCountry,
      style: selectedStyle,
    },
    options: {
      regions,
      countries,
      styles,
    },
    filtered,
  };
}

/**
 * DestinationsFilters component.
 *
 * Props:
 * - destinations: full list of DestinationItem objects
 * - searchParams: optional current URL search parameters
 * - basePath: optional base path for links (default '/destinations')
 */
export default function DestinationsFilters({
  lang,
  destinations,
  searchParams,
  basePath,
}: {
  lang?: Lang;
  destinations: DestinationItem[];
  searchParams?: DestinationsSearchParams;
  basePath?: string;
}) {
  const effectiveLang: Lang = safeLang(lang);
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const i18n = {
    it: {
      sectionAria: 'Filtri',
      formAria: 'Filtri destinazioni',
      region: 'Regione',
      country: 'Paese',
      style: 'Stile',
      all: 'Tutte',
      allPlural: 'Tutti',
      resetAria: 'Reset filtri',
      reset: 'Reset',
      apply: 'Applica',
      close: 'Chiudi',
      viewing: 'Stai vedendo:',
      allRegions: 'tutte le regioni',
    },
    en: {
      sectionAria: 'Filters',
      formAria: 'Destinations filters',
      region: 'Region',
      country: 'Country',
      style: 'Style',
      all: 'All',
      allPlural: 'All',
      resetAria: 'Reset filters',
      reset: 'Reset',
      apply: 'Apply',
      close: 'Close',
      viewing: 'You are viewing:',
      allRegions: 'all regions',
    },
  } as const;

  const t = i18n[effectiveLang];

  // In App Router we usually have a lang-prefixed route (e.g. /it/destinations).
  // If the parent doesn’t pass a basePath, default to the lang-prefixed one.
  const effectiveBasePath = basePath ?? `/${effectiveLang}/destinations`;

  // Initial state comes from the URL (searchParams), but the UI is controlled client-side.
  const initial = useMemo(
    () => getDestinationsFilterState(destinations, searchParams, effectiveLang),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [selected, setSelected] = useState(initial.selected);

  // Recompute options + filtered list based on the current selection.
  const state = useMemo(
    () =>
      getDestinationsFilterState(
        destinations,
        {
          region: selected.region,
          country: selected.country,
          style: selected.style,
        },
        effectiveLang,
      ),
    [destinations, selected],
  );

  // Helpers: ensure dependent selections don't become invalid when Region changes.
  function setRegion(nextRegion: string) {
    const next = { ...selected, region: nextRegion };

    // If region changes, country/style may no longer be valid.
    const nextState = getDestinationsFilterState(
      destinations,
      {
        region: next.region,
        country: next.country,
        style: next.style,
      },
      effectiveLang,
    );

    const countryStillValid =
      !next.country ||
      nextState.options.countries.some((c) => c.slug === next.country);
    const styleStillValid =
      !next.style ||
      nextState.options.styles.some((s) => s.slug === next.style);

    setSelected({
      region: next.region,
      country: countryStillValid ? next.country : '',
      style: styleStillValid ? next.style : '',
    });
  }

  function setCountry(nextCountry: string) {
    const next = { ...selected, country: nextCountry };
    const nextState = getDestinationsFilterState(
      destinations,
      {
        region: next.region,
        country: next.country,
        style: next.style,
      },
      effectiveLang,
    );

    const styleStillValid =
      !next.style ||
      nextState.options.styles.some((s) => s.slug === next.style);

    setSelected({
      region: next.region,
      country: next.country,
      style: styleStillValid ? next.style : '',
    });
  }

  function setStyle(nextStyle: string) {
    setSelected({ ...selected, style: nextStyle });
  }

  const anyActive =
    Boolean(state.selected.region) ||
    Boolean(state.selected.country) ||
    Boolean(state.selected.style);

  return (
    <section aria-label={t.sectionAria} className='space-y-4'>
      {/* Filters (modal trigger) */}
      <button
        ref={triggerRef}
        type='button'
        onClick={() => setIsOpen(true)}
        className={[
          'mx-auto flex w-fit',
          'min-w-[180px] max-w-[220px]',
          'text-left',
          't-body text-[color:var(--paguro-text)]/80',
          'h-9 rounded-full px-4 text-xs font-semibold tracking-wide',
          'border border-[color:var(--paguro-sand)]/30',
          'bg-[color:var(--paguro-surface)]/80',
          'shadow-sm',
          'transition',
          'hover:-translate-y-[1px] hover:border-[color:var(--paguro-sand)]/45 hover:text-[color:var(--paguro-text)]',
          'focus:outline-none focus-visible:outline-none',
          'focus:ring-1 focus:ring-[color:var(--paguro-ocean)]/15',
          'items-center justify-between gap-3',
          'select-none',
        ].join(' ')}
        aria-label={t.sectionAria}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          width='24'
          height='24'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className='lucide lucide-sliders-horizontal-icon lucide-sliders-horizontal'
        >
          <path d='M10 5H3' />
          <path d='M12 19H3' />
          <path d='M14 3v4' />
          <path d='M16 17v4' />
          <path d='M21 12h-9' />
          <path d='M21 19h-5' />
          <path d='M21 5h-7' />
          <path d='M8 10v4' />
          <path d='M8 12H3' />
        </svg>
        <span className='t-section-title text-sm'>{t.sectionAria}</span>

        <span aria-hidden='true' className='opacity-70'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            className='h-4 w-4'
          >
            <path
              strokeWidth={2}
              strokeLinecap='round'
              strokeLinejoin='round'
              d='m6 9 6 6 6-6'
            />
          </svg>
        </span>
      </button>

      {mounted && isOpen
        ? createPortal(
            <div
              role='dialog'
              aria-modal='true'
              aria-label={t.formAria}
              onClick={() => {
                setIsOpen(false);
                triggerRef.current?.focus();
              }}
              className='fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/70 px-4 backdrop-blur-md'
            >
              <form
                method='get'
                action={effectiveBasePath}
                onClick={(e) => e.stopPropagation()}
                className='relative w-full max-w-2xl rounded-md border border-[color:var(--paguro-sand)]/20 bg-[color:var(--paguro-surface)] p-6 shadow-xl max-h-[85vh] overflow-auto'
              >
                <div className='flex items-center justify-between'>
                  <h2 className='t-section-title font-semibold'>
                    {t.sectionAria}
                  </h2>
                  <button
                    type='button'
                    aria-label={t.close}
                    onClick={() => {
                      setIsOpen(false);
                      triggerRef.current?.focus();
                    }}
                    className='text-[color:var(--paguro-text)] text-xl [font-family:var(--font-ui)] transition-transform duration-300 hover:scale-[1.2]'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth='1.5'
                      stroke='currentColor'
                      className='size-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
                      />
                    </svg>
                  </button>
                </div>

                <div className='mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-3'>
                  {/* Region */}
                  <label className='grid gap-1'>
                    <span
                      id='destinations-filter-region'
                      className='t-section-title text-base px-4 font-medium text-[color:var(--paguro-text)]'
                    >
                      {t.region}
                    </span>

                    <PaguroSelect
                      name='region'
                      labelId='destinations-filter-region'
                      value={selected.region}
                      onValueChange={setRegion}
                      placeholder={t.all}
                      options={state.options.regions.map((r) => ({
                        value: r.slug,
                        label: r.label,
                      }))}
                    />
                  </label>

                  {/* Country */}
                  <label className='grid gap-1'>
                    <span
                      id='destinations-filter-country'
                      className='t-section-title text-base px-4 font-medium text-[color:var(--paguro-text)]'
                    >
                      {t.country}
                    </span>

                    <PaguroSelect
                      name='country'
                      labelId='destinations-filter-country'
                      value={selected.country}
                      onValueChange={setCountry}
                      placeholder={t.allPlural}
                      options={state.options.countries.map((c) => ({
                        value: c.slug,
                        label: c.label,
                      }))}
                    />
                  </label>

                  {/* Style filter (future) */}
                  {/**
                  <label className='grid gap-1'>
                    <span
                      id='destinations-filter-style'
                      className='t-section-title text-base font-medium text-[color:var(--paguro-text)]'
                    >
                      {t.style}
                    </span>

                    <PaguroSelect
                      name='style'
                      labelId='destinations-filter-style'
                      value={selected.style}
                      onValueChange={setStyle}
                      placeholder={t.allPlural}
                      options={state.options.styles.map((s) => ({
                        value: s.slug,
                        label: s.label,
                      }))}
                    />
                  </label>
                  */}
                </div>

                <div className='mt-4 flex flex-col items-stretch justify-center gap-3 border-t border-[color:var(--paguro-sand)]/15 pt-4 sm:flex-row sm:items-center sm:justify-between'>
                  <a
                    href={effectiveBasePath}
                    className='t-card-title text-sm text-[color:var(--paguro-text)]/70 underline underline-offset-4 hover:text-[color:var(--paguro-ocean)]'
                    aria-label={t.resetAria}
                  >
                    {t.reset}
                  </a>

                  <Button type='submit'>{t.apply}</Button>
                </div>
              </form>
            </div>,
            document.body,
          )
        : null}

      {/* Selected summary (derived from URL params) */}
      {anyActive ? (
        <p className='text-center text-sm text-[color:var(--paguro-text)]/70'>
          {t.viewing}{' '}
          <span className='font-medium'>
            {(state.selected.region
              ? (state.options.regions.find(
                  (r) => r.slug === state.selected.region,
                )?.label ?? state.selected.region)
              : t.allRegions) +
              (state.selected.country
                ? ` · ${state.options.countries.find((c) => c.slug === state.selected.country)?.label ?? state.selected.country}`
                : '') +
              (state.selected.style
                ? ` · ${state.options.styles.find((s) => s.slug === state.selected.style)?.label ?? state.selected.style}`
                : '')}
          </span>
        </p>
      ) : null}

      {/*
        Filters implemented here:
        - Region
        - Country
        - Travel style (Option A: inferred from linked posts)
      */}
    </section>
  );
}
