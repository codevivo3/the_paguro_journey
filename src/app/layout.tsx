// src / app / layout.tsx;

import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='it' suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
