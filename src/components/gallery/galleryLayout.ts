import type { GalleryImage } from './galleryTypes';

export type AspectClass =
  | 'aspect-square'
  | 'aspect-video'
  | 'aspect-[3/4]'
  | 'aspect-[4/5]'
  | 'aspect-[21/9]';

type RemixSafety = {
  fragile: boolean;
  allowedMobile: AspectClass[];
};

export function hashString(input: string): number {
  // djb2
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

export function getBaseOrientation(
  img: GalleryImage
): 'portrait' | 'landscape' | 'square' | 'panorama' | undefined {
  return img.assetOrientation ?? img.orientation;
}

export function originalAspectFor(img: GalleryImage): AspectClass {
  const o = getBaseOrientation(img);

  switch (o) {
    case 'portrait':
      return 'aspect-[3/4]';
    case 'square':
      return 'aspect-square';
    case 'panorama':
      return 'aspect-[21/9]';
    case 'landscape':
    default:
      return 'aspect-video';
  }
}

export function getRemixSafety(img: GalleryImage): RemixSafety {
  const hx = img.hotspot?.x;
  const hy = img.hotspot?.y;
  const hw = img.hotspot?.width;
  const hh = img.hotspot?.height;

  const ct = img.crop?.top ?? 0;
  const cb = img.crop?.bottom ?? 0;
  const cl = img.crop?.left ?? 0;
  const cr = img.crop?.right ?? 0;

  const hasHotspot =
    typeof hx === 'number' &&
    typeof hy === 'number' &&
    typeof hw === 'number' &&
    typeof hh === 'number';

  const nearEdge =
    typeof hx === 'number' &&
    typeof hy === 'number' &&
    (hx < 0.12 || hx > 0.88 || hy < 0.12 || hy > 0.88);

  const bigSubject =
    typeof hw === 'number' && typeof hh === 'number' && (hw > 0.72 || hh > 0.72);

  const heavyCrop = cl + cr > 0.35 || ct + cb > 0.35;

  const fragile = (hasHotspot && (nearEdge || bigSubject)) || heavyCrop;

  const base = getBaseOrientation(img);

  let allowedMobile: AspectClass[];

  const w = (...a: AspectClass[]) => a;

  if (fragile) {
    switch (base) {
      case 'panorama':
        allowedMobile = w('aspect-video', 'aspect-video', 'aspect-[21/9]');
        break;
      case 'portrait':
        allowedMobile = w(
          'aspect-[4/5]',
          'aspect-[4/5]',
          'aspect-[3/4]',
          'aspect-[3/4]',
          'aspect-square'
        );
        break;
      case 'square':
        allowedMobile = w('aspect-square', 'aspect-square', 'aspect-[3/4]');
        break;
      case 'landscape':
      default:
        allowedMobile = w(
          'aspect-video',
          'aspect-video',
          'aspect-square',
          'aspect-square',
          'aspect-[3/4]'
        );
        break;
    }

    return { fragile, allowedMobile };
  }

  switch (base) {
    case 'portrait':
      allowedMobile = w(
        'aspect-[4/5]',
        'aspect-[4/5]',
        'aspect-[3/4]',
        'aspect-[3/4]',
        'aspect-square',
        'aspect-square',
        'aspect-video'
      );
      break;
    case 'square':
      allowedMobile = w(
        'aspect-square',
        'aspect-square',
        'aspect-square',
        'aspect-[3/4]',
        'aspect-[4/5]'
      );
      break;
    case 'panorama':
      allowedMobile = w(
        'aspect-video',
        'aspect-video',
        'aspect-video',
        'aspect-[21/9]',
        'aspect-square'
      );
      break;
    case 'landscape':
    default:
      allowedMobile = w(
        'aspect-video',
        'aspect-video',
        'aspect-square',
        'aspect-square',
        'aspect-[3/4]',
        'aspect-[4/5]'
      );
      break;
  }

  return { fragile, allowedMobile };
}

export function pickFromAllowed(seed: number, allowed: AspectClass[]): AspectClass {
  if (!allowed.length) return 'aspect-video';
  return allowed[seed % allowed.length];
}

export function pickRemixedAspectDesktop(img: GalleryImage): AspectClass {
  if (img.lockOrientation) {
    return originalAspectFor(img);
  }

  const baseOrientation = getBaseOrientation(img);
  const seed = hashString(img.src);
  const r = seed % 100;

  let chosen: AspectClass =
    r < 30
      ? 'aspect-square'
      : r < 55
      ? 'aspect-[3/4]'
      : r < 70
      ? 'aspect-[4/5]'
      : 'aspect-video';

  if (baseOrientation === 'panorama' && r < 10) {
    chosen = 'aspect-[21/9]';
  }

  if (baseOrientation === 'landscape' || baseOrientation === 'panorama') {
    if (chosen === 'aspect-[4/5]') chosen = 'aspect-video';
    if (chosen === 'aspect-[3/4]' && r % 2 === 0) chosen = 'aspect-square';

    if (chosen === 'aspect-[21/9]' && baseOrientation !== 'panorama') {
      chosen = 'aspect-video';
    }
  }

  if (baseOrientation === 'portrait') {
    if (chosen === 'aspect-video') {
      chosen = r % 2 === 0 ? 'aspect-square' : 'aspect-[3/4]';
    }

    if (chosen === 'aspect-[21/9]') chosen = 'aspect-square';
  }

  if (baseOrientation === 'square') {
    chosen = r < 20 ? 'aspect-[3/4]' : 'aspect-square';
  }

  return chosen;
}

export function pickMobileForcedAspect(
  img: GalleryImage,
  globalIndex: number,
  columnIndex: number
): AspectClass {
  if (img.lockOrientation) return originalAspectFor(img);

  const seed = hashString(img.src);
  const { allowedMobile } = getRemixSafety(img);

  const clampToAllowed = (candidate: AspectClass) =>
    allowedMobile.includes(candidate)
      ? candidate
      : pickFromAllowed(seed + globalIndex + columnIndex * 17, allowedMobile);

  const basePattern: AspectClass[] = [
    'aspect-square',
    'aspect-[3/4]',
    'aspect-square',
    'aspect-[4/5]',
    'aspect-video',
    'aspect-[3/4]',
  ];

  const middlePattern: AspectClass[] = [
    'aspect-square',
    'aspect-[3/4]',
    'aspect-square',
    'aspect-[4/5]',
    'aspect-[3/4]',
    'aspect-square',
    'aspect-video',
  ];

  const pattern = columnIndex === 1 ? middlePattern : basePattern;

  const columnOffset = (seed + columnIndex * 11) % pattern.length;
  const patternIndex = (globalIndex + columnOffset) % pattern.length;
  let chosen = pattern[patternIndex];

  const jitter = (seed + globalIndex * 18 + columnIndex * 36) % 100;
  if (jitter < 28) {
    chosen = 'aspect-square';
  } else if (jitter < 46) {
    chosen = 'aspect-[3/4]';
  } else if (jitter < 56) {
    chosen = 'aspect-[4/5]';
  } else if (jitter < 32) {
    chosen = 'aspect-video';
  }

  return clampToAllowed(chosen);
}

export function getObjectPosition(img: GalleryImage): string {
  const x = img.hotspot?.x;
  const y = img.hotspot?.y;

  if (typeof x === 'number' && typeof y === 'number') {
    const px = Math.max(0, Math.min(1, x)) * 100;
    const py = Math.max(0, Math.min(1, y)) * 100;
    return `${px}% ${py}%`;
  }

  return '50% 50%';
}
