'use client';

export default function Loading() {
  return (
    <div className='mt-6 flex w-full items-center justify-center'>
      {/* Gradient ring */}
      <div
        className='
          relative h-10 w-10 animate-spin rounded-full p-[2px]
          bg-gradient-to-r
          from-[color:var(--paguro-ocean)]
          via-[color:var(--paguro-deep)]
          via-[color:var(--paguro-sand)]
          via-[color:var(--paguro-sunset)]
          to-[color:var(--paguro-coral)]
        '
        aria-label='Loading search results'
        role='status'
      >
        {/* Inner cutout */}
        <div className='h-full w-full rounded-full bg-[color:var(--paguro-surface)]' />
      </div>
    </div>
  );
}
