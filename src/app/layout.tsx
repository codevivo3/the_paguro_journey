import type { Metadata } from 'next';

// Root layout shared across all routes
import './globals.css';
// Configure global fonts
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

// Default site metadata
export const metadata: Metadata = {
  title: 'The Paguro Journey',
  description: 'Viaggia con Paguro: text, text e text.',
};

// Wrap all pages
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
      <body className='antialiased'>
        <UIProvider>
          {/* Render global navigation */}
          <Navbar />
          {/* Render current route */}
          {children}
        </UIProvider>
      </body>
      <footer>
        <Footer />
      </footer>
    </html>
  );
}
