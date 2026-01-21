import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio | The Paguro Journey',
  robots: { index: false, follow: false },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
