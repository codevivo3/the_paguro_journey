// src/app/layout.tsx

import type { ReactNode } from 'react';

import './globals.css';

import {
  Merriweather,
  Libre_Baskerville,
  Plus_Jakarta_Sans,
} from 'next/font/google';

const merriweather = Merriweather({
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre-baskerville',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang='it'
      suppressHydrationWarning
      className={`${merriweather.variable} ${libreBaskerville.variable} ${plusJakarta.variable}`}
    >
      <body suppressHydrationWarning className='antialiased'>
        {children}
      </body>
    </html>
  );
}
