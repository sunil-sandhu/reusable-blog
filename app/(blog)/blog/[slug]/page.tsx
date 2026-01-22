import { MarkdownRenderer } from "@/components/markdown-renderer";
import { BlogPostHeader } from "@/components/blog-post-header";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getPost } from "@/lib/blog";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  if (!process.env.NEXT_PUBLIC_WEBSITE_NAME || !process.env.NEXT_PUBLIC_URL) {
    console.warn("NEXT_PUBLIC_WEBSITE_NAME or NEXT_PUBLIC_URL is not set");
    return {};
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL;
  const blogName = process.env.NEXT_PUBLIC_WEBSITE_NAME;

  const { slug } = await params;
  const post = await getPost(slug, "database");
  if (!post) {
    notFound();
  }
  return {
    title: post.title,
    description: post.description || "",
    keywords: [post.topic || ""],
    publisher: blogName,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.featured_image_url || ""],
      url: `${baseUrl}/blog/${post.slug}`,
      type: "article",
      siteName: blogName,
      locale: "en_US",
      authors: [post.author || ""],
      tags: [post.topic || ""],
      publishedTime: post.date || "",
      modifiedTime: post.date || "",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await getPost(slug, "database");

  if (!post) {
    notFound();
  }

  return (
    <article className="relative w-full mx-auto bg-white">
      {/* Header section */}
      <BlogPostHeader post={post} />

      {/* Hero Image */}
      {post.featured_image_url && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="w-full overflow-hidden">
            <img
              src={post.featured_image_url}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <MarkdownRenderer
          content={post.content}
          isMDX={post.isMDX}
          title={post.title}
        />
      </div>
    </article>
  );
}
