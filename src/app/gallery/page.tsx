import GalleryGrid from '@/components/gallery/GalleryGrid';
import { getGalleryImages } from '@/lib/gallery';

export default function GalleryPage() {
  const images = getGalleryImages()

  return (
    <main className='px-6 pb-24 pt-24'>
      <div className='mx-auto max-w-5xl space-y-10'>
        <header className='space-y-3'>
          <h1 className='t-page-title'>Gallery</h1>
          <p className='t-page-subtitle'>
            Solo foto. Clicca per aprire la versione full-res.
          </p>
        </header>

        <GalleryGrid items={images} />
      </div>
    </main>
  );
}
