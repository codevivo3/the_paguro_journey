'use client';

import * as React from 'react';
import * as Select from '@radix-ui/react-select';

const CLEAR_VALUE = '__paguro_clear__';

type Option = { value: string; label: string };

type PaguroSelectProps = {
  /** For GET forms (hidden input) */
  name: string;
  /** Controlled value ('' means “all”) */
  value: string;
  /** Called on selection */
  onValueChange: (value: string) => void;
  /** Options list */
  options: Option[];
  /** Placeholder shown when value === '' */
  placeholder: string;
  /** Optional id for label aria */
  labelId?: string;
  /** Optional extra classes for the trigger */
  className?: string;
};

function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' {...props}>
      <path
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        d='m6 9 6 6 6-6'
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' {...props}>
      <path
        strokeWidth={2}
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M20 6 9 17l-5-5'
      />
    </svg>
  );
}

export default function PaguroSelect({
  name,
  value,
  onValueChange,
  options,
  placeholder,
  labelId,
  className = '',
}: PaguroSelectProps) {
  const filteredOptions = React.useMemo(() => {
    const ph = (placeholder ?? '').trim().toLowerCase();
    return (options ?? []).filter((opt) => {
      const v = (opt?.value ?? '').trim();
      const l = (opt?.label ?? '').trim().toLowerCase();

      // Never allow empty or CLEAR_VALUE in the options list (handled separately).
      if (!v) return false;
      if (v === CLEAR_VALUE) return false;

      // If someone included an “All/Tutte” option, hide it (placeholder already covers it).
      if (ph && l === ph) return false;

      return true;
    });
  }, [options, placeholder]);

  // Hidden input keeps your existing GET form flow working.
  // Radix Select itself does NOT submit like a native <select>.
  return (
    <>
      <input type='hidden' name={name} value={value} />

      <Select.Root
        value={(value === '' ? undefined : value) as unknown as string}
        onValueChange={(next) => {
          onValueChange(next === CLEAR_VALUE ? '' : next);
        }}
      >
        <Select.Trigger
          aria-labelledby={labelId}
          className={[
            't-body font-semibold tracking-wide',
            'h-10 w-full rounded-full px-4 text-sm',
            'inline-flex items-center justify-between gap-3',
            'border border-[color:var(--paguro-sand)]/20',
            'bg-[color:var(--paguro-surface)]',
            'shadow-[0_8px_22px_rgba(0,0,0,0.14)]',
            'transition',
            'hover:-translate-y-[1px] hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)]',
            'focus:outline-none focus-visible:outline-none',
            'focus:ring-1 focus:ring-[color:var(--paguro-ocean)]/25',
            'data-[state=open]:shadow-[0_12px_30px_rgba(0,0,0,0.18)]',
            className,
          ].join(' ')}
        >
          <Select.Value placeholder={placeholder} />
          <Select.Icon className='opacity-70'>
            <ChevronDownIcon className='h-5 w-5' />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            position='popper'
            side='bottom'
            sideOffset={8}
            align='start'
            avoidCollisions
            collisionPadding={{ top: 96, bottom: 24, left: 16, right: 16 }}
            className={[
              'z-[70]',
              // Match trigger width (and clamp to viewport)
              'w-[var(--radix-select-trigger-width)]',
              'max-w-[calc(100vw-32px)]',
              'overflow-hidden rounded-2xl',
              'border border-[color:var(--paguro-sand)]/25',
              // Less "glassy": solid surface, no blur
              'bg-[color:var(--paguro-surface)]',
              'shadow-[0_12px_40px_rgba(0,0,0,0.16)]',
              // Cap the menu to the available viewport height Radix computes.
              'max-h-[var(--radix-select-content-available-height)]',
            ].join(' ')}
          >
            <Select.Viewport className='max-h-[var(--radix-select-content-available-height)] overflow-y-auto p-1'>
              {value !== '' ? (
                <Select.Item
                  value={CLEAR_VALUE}
                  className={[
                    'group relative flex w-full cursor-pointer select-none items-center justify-between',
                    'rounded-xl px-4 py-2',
                    'text-sm text-[color:var(--paguro-text)]',
                    'outline-none',
                    'data-[highlighted]:bg-[color:var(--paguro-ocean)]/10',
                    // keep checked styling subtle (no big background pill)
                    'data-[state=checked]:font-semibold',
                  ].join(' ')}
                >
                  <Select.ItemText>
                    <span className='truncate'>{placeholder}</span>
                  </Select.ItemText>
                  <Select.ItemIndicator className='inline-flex items-center opacity-70'>
                    <CheckIcon className='h-4 w-4' />
                  </Select.ItemIndicator>
                </Select.Item>
              ) : null}

              {filteredOptions.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={[
                    'group relative flex w-full cursor-pointer select-none items-center justify-between rounded-xl px-4 py-2',
                    'text-sm text-[color:var(--paguro-text)]',
                    'outline-none',
                    'data-[highlighted]:bg-[color:var(--paguro-ocean)]/10',
                    'data-[state=checked]:font-semibold',
                  ].join(' ')}
                >
                  <Select.ItemText>
                    <span className='truncate'>{opt.label}</span>
                  </Select.ItemText>
                  <Select.ItemIndicator className='inline-flex items-center opacity-70'>
                    <CheckIcon className='h-4 w-4' />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}
