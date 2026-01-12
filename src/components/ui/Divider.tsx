type DividerIcon = {
  /** Stable key for React lists */
  key: string;
  /** Lucide-ish class for dev readability (optional) */
  className?: string;
  /** The SVG paths/shapes */
  node: React.ReactNode;
};

const ICON_SIZE = 144;

// Keep this list tight: 4–6 icons is ideal.
// Add/remove icons here without touching the JSX below.
const ICONS: DividerIcon[] = [
  {
    key: 'compass',
    className: 'lucide lucide-compass',
    node: (
      <>
        <path d='m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z' />
        <circle cx='12' cy='12' r='10' />
      </>
    ),
  },
  {
    key: 'map',
    className: 'lucide lucide-map',
    node: (
      <>
        <path d='M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z' />
        <path d='M15 5.764v15' />
        <path d='M9 3.236v15' />
      </>
    ),
  },
  {
    key: 'pin',
    className: 'lucide lucide-map-pin',
    node: (
      <>
        <path d='M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0' />
        <circle cx='12' cy='10' r='3' />
      </>
    ),
  },
  {
    key: 'image',
    className: 'lucide lucide-image',
    node: (
      <>
        <rect width='18' height='18' x='3' y='3' rx='2' ry='2' />
        <circle cx='9' cy='9' r='2' />
        <path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
      </>
    ),
  },
  {
    key: 'mountain',
    className: 'lucide lucide-mountain-snow',
    node: (
      <>
        <path d='m8 3 4 8 5-5 5 15H2L8 3z' />
        <path d='M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19' />
      </>
    ),
  },
  {
    key: 'waves',
    className: 'lucide lucide-waves',
    node: (
      <>
        <path d='M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' />
        <path d='M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' />
        <path d='M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1' />
      </>
    ),
  },
];

export default function Divider() {
  return (
    <div
      className={
        // Layout: dense, “watermark-ish” grid that can wrap into rows.
        // Color: inherit from parent (set `text-[color:var(--paguro-deep)]/80` where you use it)
        // Fade: use parent opacity/gradient if desired.
        'flex flex-wrap items-center justify-between gap-x-4 gap-y-3 py-2'
      }
      aria-hidden='true'
    >
      {ICONS.map((icon) => (
        <svg
          key={icon.key}
          xmlns='http://www.w3.org/2000/svg'
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
          className={icon.className}
        >
          {icon.node}
        </svg>
      ))}
    </div>
  );
}
