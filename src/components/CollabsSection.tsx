export default function CollaborationsSection() {
  return (
    <section className='py-16 px-6'>
      <div className='mx-auto max-w-3xl text-center space-y-6'>
        {/* Title */}
        <h3 className='[font-family:var(--font-ui)] text-4xl font-semibold text-black'>
          Collaborations
        </h3>

        {/* Divider (optional but recommended) */}
        <div className='mx-auto h-px w-16 bg-black/20' />

        {/* List */}
        <ul className='space-y-2 text-black/80'>
          <li>Brand / Project One</li>
          <li>Brand / Project Two</li>
          <li>Brand / Project Three</li>
        </ul>
      </div>
    </section>
  );
}
