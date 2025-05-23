import Link from "next/link";
import { getLatestDatabasePosts } from "@/lib/blog/database";
import { formatDate } from "@/lib/utils";
import FormRenderer from "@/components/FormulaV24StandaloneRenderer/App";

export const revalidate = 86400; // Revalidate every 24 hours as fallback

export default async function HomePage() {
  const latestPosts = await getLatestDatabasePosts();

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-6xl font-bold mb-6 pt-12">
          {process.env.NEXT_PUBLIC_WEBSITE_NAME || "The Blog"}
        </h1>
        <p className="text-xl text-foreground/80 max-w-2xl">
          {process.env.NEXT_PUBLIC_WEBSITE_DESCRIPTION}
        </p>
      </section>

      {/* Featured Posts */}
      <section className="mb-16">
        <h2 className="text-3xl font-semibold mb-8">Latest Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {latestPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="h-full flex flex-col">
                {post.featured_image_url ? (
                  <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-lg">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video mb-4 overflow-hidden rounded-lg bg-gray-200" />
                )}
                <div className="flex-1">
                  {post.topic && (
                    <span className="text-sm font-medium text-brand mb-2 block">
                      {post.topic}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-brand transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-foreground/70 mb-4 line-clamp-2">
                    {post.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-foreground/60">
                    {post.author && <span>{post.author}</span>}
                    {post.date && (
                      <time dateTime={post.date}>{formatDate(post.date)}</time>
                    )}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-4xl mx-auto text-center">
        <FormRenderer />
      </section>
    </main>
  );
}
