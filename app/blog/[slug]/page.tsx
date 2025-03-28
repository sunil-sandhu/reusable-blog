import TableOfContents from "@/app/components/TableOfContents";
import { MarkdownRenderer } from "../../components/MarkdownRenderer";
import { getPost } from "../../lib/blog";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const baseUrl = "https://cubed.run";
  const blogName = "Cubed";

  const { slug } = await params;
  const post = await getPost(slug, "local");
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

  const post = await getPost(slug, "local"); // For now, we'll only fetch local posts

  if (!post) {
    notFound();
  }

  // Format the date
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="container mx-auto px-4 py-8">
      {/* Full-width header section */}
      <header className="w-full mb-12 pt-4 pb-12 lg:pt-24 lg:pb-24 bg-gradient-to-t from-background-secondary to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {post.topic && (
              <div className="pt-2">
                <a
                  href={`/topics/${post.topic}`}
                  className="inline-flex px-3.5 py-1.5 text-sm font-medium text-brand hover:text-brand/80 bg-brand/5 dark:bg-brand/10 rounded-full transition-colors"
                >
                  {post.topic}
                </a>
              </div>
            )}

            {/* Title */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-heading dark:text-gray-100 leading-tight tracking-tight">
                {post.title}
              </h1>
            </div>

            {/* Author and Date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-subtext dark:text-gray-400">
              {post.author && (
                <div className="flex items-center gap-1.5">
                  <span className="text-text dark:text-gray-500">By</span>
                  <p className="font-medium text-heading dark:text-gray-200 hover:text-brand dark:hover:text-brand transition-colors">
                    {post.author}
                  </p>
                </div>
              )}
              {post.date && (
                <div className="flex items-center gap-1.5">
                  <span className="text-text dark:text-gray-500 mr-1">•</span>
                  <span className="font-medium">Published on</span>
                  <time className="text-sm text-gray-500">{formattedDate}</time>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content section with TOC */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="relative grid grid-cols-1 lg:grid-cols-[240px,1fr] xl:grid-cols-[280px,1fr] gap-16">
          {/* Left Sidebar - Table of Contents */}
          {/* <aside className="hidden lg:block">
            <div className="sticky top-16 pr-8 border-r border-border border-solid">
              <TableOfContents />
            </div>
          </aside> */}

          {/* Main Content Area */}
          <div className="max-w-4xl md:mr-8">
            <MarkdownRenderer content={post.content} />
          </div>
        </div>
      </div>
    </article>
  );
}
