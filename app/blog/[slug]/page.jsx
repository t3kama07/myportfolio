import { permanentRedirect } from "next/navigation";
import { blogPosts } from "../../data/blogPosts";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostRedirectPage({ params }) {
  const { slug } = await params;
  permanentRedirect(`/en/blog/${slug}`);
}
