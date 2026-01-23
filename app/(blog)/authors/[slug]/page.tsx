import Link from "next/link";
import { getPostsByAuthor } from "@/lib/blog";

export const revalidate = 86400; // Revalidate every 24 hours

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await getPostsByAuthor(slug);
  const authorName = slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  
  return (
    <main className="w-full">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="border-t border-gray-300 pt-8 mb-8">
          <h1 className="text-xs uppercase tracking-wide text-black mb-8">{authorName.toUpperCase()}</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
              <article className="flex flex-col">
                {post.featured_image_url ? (
                  <div className="relative w-full aspect-video mb-4 overflow-hidden">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="relative w-full aspect-video mb-4 bg-gray-200" />
                )}
                {post.topic && (
                  <span className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    {post.topic}
                  </span>
                )}
                <h3 className="text-lg font-mono font-normal mb-2 leading-tight">
                  {post.title}
                </h3>
                {post.author && (
                  <span className="text-xs uppercase tracking-wide text-gray-500">
                    BY {post.author.toUpperCase()}
                  </span>
                )}
              </article>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
