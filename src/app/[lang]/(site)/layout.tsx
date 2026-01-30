// src / app / [lang] / site / layout.tsx;

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import Navbar from '@/components/sections/NavbarSection';
import Footer from '@/components/sections/FooterSection';
import { safeLang, type Lang } from '@/lib/route';

export default function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const effectiveLang: Lang = safeLang(params.lang as Lang);

  return (
    <div className='min-h-screen flex flex-col'>
      <Suspense fallback={null}>
        <Navbar lang={effectiveLang} />
      </Suspense>

      <div className='flex-1'>{children}</div>

      <Footer lang={effectiveLang} />
    </div>
  );
}
