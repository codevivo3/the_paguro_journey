export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content?: string[];
  date?: string;
  linkAddress?: string;
  imageUrl1?: string;
  imageUrl2?: string;
  imageUrl3?: string;
};

// Temporary local data (later this will come from Sanity)
export const posts: Post[] = [
  {
    slug: 'viaggiare-in-cina-nel-2024',
    title: 'Viaggiare in Cina nel 2024',
    excerpt: 'Racconti e consigli di viaggio 🇨🇳.',
    linkAddress:
      'https://www.youtube.com/watch?v=V5M__hG4dV8&list=PLstiwxBQHBusIpFOMNlsJf4Ekoin0XJTy',
    imageUrl1: '/destinations/china/cina-ponte-guangxi.jpg',
    imageUrl2: '/destinations/china/mattia-tiger-leaping-gorge.jpg',
    imageUrl3: '/destinations/china/campi-terrazzati-yuan-yang.jpg',
  },
  {
    slug: 'viaggio-in-centro-america-2025',
    title: 'Viaggio in Centro America 2025',
    excerpt: 'Dal Costa Rica al Nicaragua 🇨🇷 🇬🇹 🇳🇮.',
    linkAddress:
      'https://www.youtube.com/playlist?list=PLstiwxBQHBuslSuTlFVBrn6ln_PFQihyO',
    imageUrl1: '/destinations/guatemala/guatemala-mattia-cammina-chichi.jpg',
    imageUrl2: '/destinations/guatemala/guatemala-vale-datch-angle.jpg',
    imageUrl3: '/destinations/guatemala/volti-di-antigua.jpg',
  },
  {
    slug: 'esplorando-la-mongolia',
    title: 'Esplorando la Mongolia',
    excerpt: 'Un viaggio avventuroso in Asia Centrale 🇲🇳.',
    linkAddress:
      'https://www.youtube.com/playlist?list=PLstiwxBQHButvJMlFXsP6sd4gkC3wFuEL',
    imageUrl1: '/destinations/mongolia/vale-duna-gobi.jpg',
    imageUrl2: '/destinations/mongolia/vale-mattia-in-tenda.jpg',
    imageUrl3: '/destinations/mongolia/valentina-on-the-road.jpg',
  },
];
