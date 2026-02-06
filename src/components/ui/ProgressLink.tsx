'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { startTopProgress } from '@/components/ui/RouteTopLoader';

type Props = ComponentProps<typeof Link>;

export default function ProgressLink({ onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        startTopProgress();
        onClick?.(e);
      }}
    />
  );
}
