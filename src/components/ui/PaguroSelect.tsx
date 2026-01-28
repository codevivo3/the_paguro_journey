'use client';

const CLEAR_VALUE = '__paguro_clear__';

import * as React from 'react';
import * as Select from '@radix-ui/react-select';

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
            // Same “pill” look you already liked
            't-body text-[color:var(--paguro-text)]',
            'h-11 w-full rounded-full px-4 text-sm font-semibold',
            'bg-gradient-to-b from-[var(--pill-from)] to-[var(--pill-to)]',
            'shadow-[0_6px_18px_rgba(0,0,0,0.12)]',
            'transition',
            'hover:-translate-y-[1px] hover:shadow-[0_10px_26px_rgba(0,0,0,0.14)]',
            'focus:outline-none focus-visible:outline-none',
            'focus:ring-1 focus:ring-[color:var(--paguro-ocean)]/20',
            'data-[state=open]:from-[var(--pill-from-hover)] data-[state=open]:to-[var(--pill-to-hover)]',
            // layout
            'inline-flex items-center justify-between gap-3',
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
            sideOffset={10}
            className={[
              'z-[60]',
              'min-w-[var(--radix-select-trigger-width)]',
              'overflow-hidden rounded-3xl',
              'border border-[color:var(--paguro-sand)]/25',
              'bg-[color:var(--paguro-surface)]/95 backdrop-blur-md',
              'shadow-[0_18px_60px_rgba(0,0,0,0.20)]',
            ].join(' ')}
          >
            <Select.Viewport className='p-2'>
              {/* “All” option if you want blank to mean “all” */}
              <Select.Item
                value={CLEAR_VALUE}
                className={[
                  'relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2',
                  'text-sm text-[color:var(--paguro-text)]',
                  'outline-none',
                  'data-[highlighted]:bg-[color:var(--paguro-ocean)]/10',
                  'data-[state=checked]:bg-[color:var(--paguro-ocean)]/12',
                ].join(' ')}
              >
                <Select.ItemIndicator className='absolute left-3 inline-flex items-center'>
                  <CheckIcon className='h-4 w-4' />
                </Select.ItemIndicator>
                <span className='pl-6'>{placeholder}</span>
              </Select.Item>

              <div className='my-2 h-px bg-[color:var(--paguro-sand)]/15' />

              {options.map((opt) => (
                <Select.Item
                  key={opt.value}
                  value={opt.value}
                  className={[
                    'relative flex cursor-pointer select-none items-center gap-2 rounded-xl px-3 py-2',
                    'text-sm text-[color:var(--paguro-text)]',
                    'outline-none',
                    'data-[highlighted]:bg-[color:var(--paguro-ocean)]/10',
                    'data-[state=checked]:bg-[color:var(--paguro-ocean)]/12',
                  ].join(' ')}
                >
                  <Select.ItemIndicator className='absolute left-3 inline-flex items-center'>
                    <CheckIcon className='h-4 w-4' />
                  </Select.ItemIndicator>
                  <Select.ItemText>
                    <span className='pl-6'>{opt.label}</span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}
