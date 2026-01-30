import { PortableText, type PortableTextComponents } from '@portabletext/react';

const components: PortableTextComponents = {
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined;
      const blank = Boolean(value?.blank);

      if (!href) return <>{children}</>;

      return (
        <a
          href={href}
          target={blank ? '_blank' : undefined}
          rel={blank ? 'noopener noreferrer' : undefined}
          className='underline underline-offset-4'
        >
          {children}
        </a>
      );
    },
  },
};

export default function RichText({ value }: { value: unknown }) {
  if (!Array.isArray(value) || value.length === 0) return null;
  return <PortableText value={value} components={components} />;
}
