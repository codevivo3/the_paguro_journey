export default function DestinationsLoading() {
  return (
    <main className='px-6 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        {/* Header skeleton */}
        <header className='space-y-3 text-center'>
          <div className='mx-auto h-10 w-64 rounded-md skeleton' />
          <div className='mx-auto h-4 w-96 max-w-full rounded-md skeleton' />
        </header>

        {/* Cards skeleton */}
        <section className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <article
              key={i}
              className='overflow-hidden rounded-md border border-[color:var(--paguro-border)] bg-[color:var(--paguro-surface)]'
            >
              {/* Media */}
              <div className='aspect-video skeleton' />

              {/* Body */}
              <div className='flex flex-col gap-3 p-6'>
                {/* Title */}
                <div className='h-5 w-3/4 rounded-md skeleton' />

                {/* Meta */}
                <div className='h-3 w-24 rounded-md skeleton' />

                {/* Pill */}
                <div className='h-8 w-20 rounded-full skeleton' />
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
