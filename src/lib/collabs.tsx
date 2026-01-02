export type Collaboration = {
  name: string;
  url: string;
  logoSrc: string; // per ora in /public/collabs/*
  logoAlt?: string;
};

export const collaborations: Collaboration[] = [
  {
    name: 'Brand / Progetto Uno',
    url: 'https://example.com',
    logoSrc: '/collabs/brand-one.png',
    logoAlt: 'Brand Uno',
  },
  {
    name: 'Brand / Progetto Due',
    url: 'https://example.com',
    logoSrc: '/collabs/brand-one.png',
    logoAlt: 'Brand Due',
  },
  {
    name: 'Brand / Progetto Tre',
    url: 'https://example.com',
    logoSrc: '/collabs/brand-one.png',
    logoAlt: 'Brand Tre',
  },
];
