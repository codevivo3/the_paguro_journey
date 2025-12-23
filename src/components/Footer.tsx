import Link from 'next/link';

export default function Footer() {
  return (
    <footer className='mt-32 border-t border-black/10 bg-white py-16'>
      <div className='mx-auto max-w-5xl px-6 grid gap-10 md:grid-cols-3'>
        {/* Identity */}
        <div>
          <p className='[font-family:var(--font-ui)] font-semibold'>
            The Paguro Journey
          </p>
          <p className='mt-2 text-sm opacity-70'>
            Slow travel, mindful stories, off-track destinations.
          </p>
        </div>

        {/* Navigation */}
        <nav className='text-sm space-y-2'>
          <Link href='/blog'>Blog</Link>
          <br />
          <Link href='/destinations'>Destinations</Link>
          <br />
          <Link href='/about'>About</Link>
          <br />
          <Link href='/contact'>Contact</Link>
        </nav>

        {/* Social */}
        <div className='text-sm space-y-2'>
          <a href='https://youtube.com' target='_blank'>
            YouTube ➜
          </a>
          <br />
          <a href='https://instagram.com' target='_blank'>
            Instagram ➜
          </a>
        </div>
      </div>

      <div className='mt-12 text-center text-xs opacity-50'>
        © {new Date().getFullYear()} The Paguro Journey
      </div>
    </footer>
  );
}
