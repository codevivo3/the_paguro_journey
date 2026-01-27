import type { Metadata } from 'next';

// Root layout shared across all routes (App Router)
import './globals.css';
// Google Fonts (exposed as CSS variables for Tailwind/CSS usage)
import {
  Merriweather,
  Libre_Baskerville,
  Plus_Jakarta_Sans,
} from 'next/font/google';

import { UIProvider } from '@/context/ui-context';

// -----------------------------------------------------------------------------
// Theme bootstrap (runs before hydration)
// -----------------------------------------------------------------------------
const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const stored = localStorage.getItem('theme');
    const theme =
      stored === 'dark' || stored === 'light'
        ? stored
        : window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';

    const root = document.documentElement;

    // Keep CSS variables logic
    root.dataset.theme = theme;

    // Tailwind dark mode (darkMode: 'class')
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } catch {
    // no-op (e.g. privacy mode / disabled storage)
  }
})();`;

// Fonts used throughout the application, exposed as CSS variables for styling
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

// -----------------------------------------------------------------------------
// SEO: Global metadata baseline
//
// Next.js will merge this `metadata` with route-level metadata.
// Keep these as sensible defaults; override per-page where needed.
// -----------------------------------------------------------------------------
export const metadata: Metadata = {
  // NOTE: update this to your production domain once deployed.
  // This enables correct absolute URLs for OpenGraph/Twitter images.
  metadataBase: new URL('http://thepagurojourney.com/'),

  title: {
    default: 'The Paguro Journey',
    template: '%s | The Paguro Journey',
  },

  description:
    'Racconti di viaggio, fotografie e guide pratiche per esplorare con curiosità e lentezza.',

  applicationName: 'The Paguro Journey',

  // Tell search engines the default behavior; tighten per-page if needed.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // Social share defaults (override on specific pages with custom images).
  openGraph: {
    type: 'website',
    siteName: 'The Paguro Journey',
    locale: 'it_IT',
    title: 'The Paguro Journey',
    description:
      'Racconti di viaggio, fotografie e guide pratiche per esplorare con curiosità e lentezza.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'The Paguro Journey',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'The Paguro Journey',
    description:
      'Racconti di viaggio, fotografie e guide pratiche per esplorare con curiosità e lentezza.',
    images: ['/og-default.jpg'],
  },

  // Language / alternates: add per-page canonical URLs via `alternates` when ready.
  alternates: {
    languages: {
      it: '/',
    },
  },

  // Favicon & app icons (ensure these exist in `/public`).
  icons: {
    icon: '/icon.svg',
  },
};

// -----------------------------------------------------------------------------
// Root layout component wrapping all routes
// -----------------------------------------------------------------------------
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='it'
      suppressHydrationWarning
      className={`${merriweather.variable} ${libreBaskerville.variable} ${plusJakarta.variable}`}
    >
      <head>
        {/*
          Set theme before React hydrates to avoid a flash of incorrect theme.
          This reads localStorage (user preference) and falls back to OS preference.
        */}
        <script
          // Theme bootstrap: run before hydration to avoid a flash of the wrong theme.
          // Strategy:
          // 1) localStorage.theme ("light" | "dark") wins
          // 2) otherwise fall back to OS preference
          dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body suppressHydrationWarning className='antialiased'>
        <UIProvider>
          {/* Route content */}
          {children}
        </UIProvider>
      </body>
    </html>
  );
}
