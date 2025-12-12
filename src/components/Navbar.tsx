import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className='fixed top-0 left-0 w-full z-30 bg-black/80 backdrop-blur-sm px-4 py-2'>
      <div className='flex items-center justify-between h-15 px-6'>
        {/* Logo + Title */}
        <div className='flex items-center gap-1'>
          <div className='p-3'>
            <img src='/paguro.svg' alt='Logo' className='w-12 h-12' />
          </div>
          <p className='text-white text-xl tracking-wide'>The Paguro Journey</p>
        </div>

        {/* Navigation */}
        <ul className='flex gap-10 text-white text-xl'>
          <li>
            <Link href={'/blog'}>Blog</Link>
          </li>
          <li>
            <Link href={'/destinations'}>Destinations</Link>
          </li>
          <li>
            <Link href={'/about'}>About</Link>
          </li>
          <li>
            <Link href={'/contact'}>Contact</Link>
          </li>
          <li>🔎</li>
        </ul>
      </div>
    </nav>
  );
}
