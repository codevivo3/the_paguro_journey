'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import SearchModal from '../ui/SearchModal';
import SwitchTheme from '../features/theme/ThemeToggle';

type NavItemProps = {
  href: string;
  label: string;
  active: boolean;
  liClassName: string;
  linkClassName: string;
  underlineBase: string;
  underlineInactive: string;
  underlineActive: string;
};

function NavItem({
  href,
  label,
  active,
  liClassName,
  linkClassName,
  underlineBase,
  underlineInactive,
  underlineActive,
}: NavItemProps) {
  return (
    <li className={liClassName}>
      <Link href={href} className={linkClassName}>
        {label}
      </Link>

      {/* underline bar */}
      <span
        aria-hidden='true'
        className={`${underlineBase} ${active ? underlineActive : underlineInactive}`}
      />
    </li>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // LI is the positioning + hover group container
  const LI_CLASS =
    'relative px-1 py-1 text-sm font-semibold text-white group cursor-pointer';

  // Link stays in normal flow (no absolute, no w-0)
  const LINK_CLASS = 'relative z-10 inline-flex items-center justify-center';

  // Underline is the absolute element
  const UNDERLINE_BASE =
    'absolute left-0 bottom-0 h-[2px] bg-white rounded-full transition-all duration-300';

  // States for underline
  const UNDERLINE_INACTIVE = 'w-0 group-hover:w-full';
  const UNDERLINE_ACTIVE = 'w-full';

  return (
    <nav className='fixed top-0 right-0 left-0 z-[9999] isolate [font-family:var(--font-ui)] bg-[color:var(--paguro-deep)]/80 backdrop-blur-sm'>
      <div className='mx-auto flex max-w-6xl items-center justify-between h-12 px-6 lg:px-12'>
        {/* Logo */}
        <Link
          href='/'
          aria-label='Go to homepage'
          className='flex items-center rounded-xl transition-transform duration-200 ease-out hover:-translate-y-0.3 hover:scale-105 active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50'
        >
          <Image
            src='/logo/paguro-logo-white.svg'
            alt='The Paguro Journey'
            width={100}
            height={100}
            className='h-7 sm:h-8 md:h-9 w-auto'
            priority
          />
        </Link>

        {/* Navigation */}
        <ul className='flex items-center gap-6 text-white text-[clamp(0.7rem,1.1vw,0.9rem)]'>
          <NavItem
            href='/blog'
            label='Blog'
            active={isActive('/blog')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/destinations'
            label='Destinazioni'
            active={isActive('/destinations')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/gallery'
            label='Galleria'
            active={isActive('/gallery')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/about'
            label='Chi Siamo'
            active={isActive('/about')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <NavItem
            href='/contact'
            label='Contatti'
            active={isActive('/contact')}
            liClassName={LI_CLASS}
            linkClassName={LINK_CLASS}
            underlineBase={UNDERLINE_BASE}
            underlineInactive={UNDERLINE_INACTIVE}
            underlineActive={UNDERLINE_ACTIVE}
          />
          <li>
            <SearchModal />
          </li>
          <li>
            <SwitchTheme />
          </li>
        </ul>
      </div>
    </nav>
  );
}
