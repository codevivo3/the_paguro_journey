// src / app / [lang] / site / layout.tsx;

import type { ReactNode } from 'react';
import { Suspense } from 'react';

import Navbar from '@/components/sections/NavbarSection';
import Footer from '@/components/sections/FooterSection';
import { safeLang, type Lang } from '@/lib/route';

export default async function SiteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: Lang }>;
}) {
  const { lang } = await params;
  const effectiveLang: Lang = safeLang(lang);

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
