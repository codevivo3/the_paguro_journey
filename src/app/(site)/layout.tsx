import type { ReactNode } from 'react';
import { Suspense } from 'react';

import Navbar from '@/components/sections/NavbarSection';
import Footer from '@/components/sections/FooterSection';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen flex flex-col'>
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>

      <div className='flex-1'>{children}</div>

      <Footer />
    </div>
  );
}
