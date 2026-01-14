import type { ReactNode } from 'react';

import Navbar from '@/components/sections/NavbarSection';
import Footer from '@/components/sections/FooterSection';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
