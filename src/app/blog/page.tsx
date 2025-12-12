import Link from 'next/link';

// Blog index page displaying list of posts
export default function BlogPage() {
  // Semantic page wrapper
  return (
    <main>
      {/* Introduces the blog */}
      <header>
        <h1>Blog</h1>
        <p>
          Stories, reflections, and guides about mindful travel and
          off-the-beaten-path destinations.
        </p>
      </header>

      {/* Lists available blog posts */}
      <section>
        <h2>Latest Articles</h2>

        {/* Links route to dynamic [slug] pages */}
        <ul className='flex'>
          <li>
            <Link href='/blog/slow-travel-thailand'>
              Slow Travel in Thailand
              <img className='w-1/3 h-auto' src='/placeholder_view_vector.png' alt='placeholder' />
            </Link>
          </li>

          <li>
            <Link href='/blog/off-the-beaten-path-greece'>
              Off the Beaten Path in Greece
              <img className='w-1/3 h-auto' src='/placeholder_view_vector.png' alt='placeholder' />
            </Link>
          </li>

          <li>
            <Link href='/blog/sustainable-travel-basics'>
              Sustainable Travel Basics
              <img className='w-1/3 h-auto' src='/placeholder_view_vector.png' alt='placeholder' />
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
