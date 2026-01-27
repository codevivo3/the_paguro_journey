import type { ReactNode } from 'react';
import { Suspense } from 'react';

import Navbar from '@/components/sections/NavbarSection';
import Footer from '@/components/sections/FooterSection';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      {children}

      <Footer />
    </>
  );
}
