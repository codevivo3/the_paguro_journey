'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type HermitCrabLottieProps = {
  className?: string;
};

export default function HermitCrabLottie({ className }: HermitCrabLottieProps) {
  return (
    <div className={className}>
      {/* Served from Next.js /public. File path: public/lottie/crab_walk.lottie */}
      <DotLottieReact src='/lottie/crab_walk.lottie' autoplay loop />
    </div>
  );
}
