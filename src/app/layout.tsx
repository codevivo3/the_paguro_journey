import type { Metadata } from 'next';

// Global root layout shared across all routes (App Router)
import './globals.css';
// Configure global Google Fonts (exposed as CSS variables)
import { Merriweather, Libre_Baskerville, K2D } from 'next/font/google';

import Navbar from '@/components/Navbar';
import { UIProvider } from '@/context/ui-context';
import Footer from '@/components/Footer';

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

const k2d = K2D({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-k2d',
  display: 'swap',
});

// Default site metadata (SEO baseline)
export const metadata: Metadata = {
  title: 'The Paguro Journey',
  description: 'Viaggia con Paguro: text, text e text.',
};

// Root layout component wrapping all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${merriweather.variable} ${libreBaskerville.variable} ${k2d.variable}`}
    >
      <body suppressHydrationWarning className='antialiased'>
        <UIProvider>
          {/* Global navigation (persistent across routes) */}
          <Navbar />
          {/* Page content rendered by the active route */}
          {children}
          {/* Global footer (persistent across routes) */}
          <Footer />
        </UIProvider>
      </body>
    </html>
  );
}
