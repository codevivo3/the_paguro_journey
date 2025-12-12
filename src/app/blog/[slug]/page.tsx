type PageProps = {
  params: {
    slug: string;
  };
};

export default function BlogPostPage({ params }: PageProps) {
  const { slug } = params;

  return <h1>{slug}</h1>;
}
