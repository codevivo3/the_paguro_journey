'use client';

import { useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import HermitCrabLottie from '@/components/lottie/HermitCrabLottie';

type Lang = 'it' | 'en';

export default function NotFound() {
  const params = useParams();
  const lang = (params?.lang === 'en' ? 'en' : 'it') as Lang;

  const copy = {
    it: {
      title: '404 — Pagina non trovata',
      body: 'Questa pagina non esiste — continua a esplorare.',
      cta: 'Torna alla Home',
    },
    en: {
      title: '404 — Page not found',
      body: 'This page doesn’t exist — keep exploring.',
      cta: 'Back to Home',
    },
  } as const;

  const t = copy[lang];

  return (
    <main className='flex flex-1 items-center justify-center py-10'>
      <div className='mx-auto mt-10 w-full text-center space-y-4 px-6'>
      <HermitCrabLottie className='crab-run translate-x-[20vw]' />
        <div className='relative overflow-hidden'></div>

        <h1 className='t-section-title text-3xl'>{t.title}</h1>
        <p className='t-body'>{t.body}</p>

        <div className='pt-2'>
          <Button href={`/${lang}`}>{t.cta}</Button>
        </div>
      </div>
    </main>
  );
}
