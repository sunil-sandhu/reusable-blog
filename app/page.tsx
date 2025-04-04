import Link from "next/link";
import { getLatestDatabasePosts } from "@/lib/blog/database";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default async function HomePage() {
  const latestPosts = await getLatestDatabasePosts();

  return (
    <main className="container mx-auto px-4 py-12 max-w-7xl">
      {/* Hero Section */}
      <section className="mb-16">
        <h1 className="text-6xl font-bold mb-6">
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
      <section className="bg-foreground/5 p-8 rounded-lg">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
          <p className="text-foreground/70 mb-6">
            Subscribe to our newsletter to receive the latest posts and updates
            directly in your inbox.
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-foreground/20 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
